import { randomUUID } from "crypto";
import { Response, Request, Router, type NextFunction } from "express";
import { emailExamples } from "../../common/adapters/emailExamples";
import { jwtService } from "../../common/adapters/jwt.service";
import { nodemailerService } from "../../common/adapters/nodemailer.service";
import { appConfig } from "../../common/config/config";
import { inputCheckErrorsMiddleware } from "../../common/middleware/input-check-errors-middleware";
import { routersPaths } from "../../common/path/paths";
import { ResultStatus } from "../../common/result/resultCode";
import { resultHelpers } from "../../common/result/resultHelpers";
import { HttpStatuses } from "../../common/types/httpStatuses";
import type { IdType } from "../../common/types/id";
import type {
  RequestWithBody,
  RequestWithUserId,
} from "../../common/types/requests";
import { inputValidation } from "../../common/validation/input.validation";
import { deviceRepository } from "../session/session.repository";
import {
  emailValidation,
  emailResendValidation,
} from "../users/middlewares/email.validation";
import { loginOrEmailValidation } from "../users/middlewares/login.or.emaol.validation";
import { loginValidation } from "../users/middlewares/login.validation";
import { passwordValidation } from "../users/middlewares/password.validation";
import { CreateUserInputDto } from "../users/types/create.user.input.dto";
import { usersQwRepository } from "../users/user.query.repository";
import { usersRepository } from "../users/user.repository";
import { authService } from "./auth.service";
import { blacklistRepository } from "./blacklist.repository";
import { accessTokenGuard } from "./guards/access.token.guard";
import { refreshTokenGuard } from "./guards/refresh.token.guard";
import { codeValidation } from "./middlewares/code.validation";
import {
  registrationLimiter,
  emailLimiter,
  loginLimiter,
} from "./middlewares/login.limiter";
import { LoginInputDto } from "./types/login.input.dto";

const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken: string = req.cookies.refreshToken;

  if (!refreshToken) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  next();
};

export const authRouter = Router();

authRouter.post(
  routersPaths.auth.registration,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputCheckErrorsMiddleware,
  registrationLimiter,
  async (req: RequestWithBody<CreateUserInputDto>, res: Response) => {
    const { login, email, password } = req.body;

    const result = await authService.registerUser(login, password, email);
    if (result.status === ResultStatus.Success) {
      return res.sendStatus(HttpStatuses.NoContent);
    }
    return res.sendStatus(HttpStatuses.NotFound);
  },
);

authRouter.post(
  routersPaths.auth.registrationConfirmation,
  codeValidation,
  inputCheckErrorsMiddleware,
  registrationLimiter,
  async (req: RequestWithBody<{ code: string }>, res: Response) => {
    const { code } = req.body;

    try {
      const user = await usersRepository.findUserByConfirmationCode(code);

      if (!user) {
        return res.status(HttpStatuses.BadRequest).send({
          errorsMessages: [
            { field: "code", message: "Invalid confirmation code" },
          ],
        });
      }

      if (user.emailConfirmation.isConfirmed) {
        return res.status(HttpStatuses.BadRequest).send({
          errorsMessages: [
            { field: "code", message: "Email is already confirmed" },
          ],
        });
      }

      user.emailConfirmation.isConfirmed = true;

      const isUpdated = await usersRepository.update(user);

      if (!isUpdated) {
        return res.status(HttpStatuses.ServerError).send({
          errorsMessages: [
            { field: "code", message: "Failed to confirm email" },
          ],
        });
      }

      return res.sendStatus(HttpStatuses.NoContent);
    } catch (error) {
      // console.error("Error during registration confirmation:", error);
      return res.sendStatus(HttpStatuses.ServerError);
    }
  },
);

authRouter.post(
  routersPaths.auth.registrationEmailResending,
  emailResendValidation,
  inputCheckErrorsMiddleware,
  emailLimiter,
  async (req: RequestWithBody<{ email: string }>, res: Response) => {
    const { email } = req.body;

    try {
      const user = await usersRepository.findByLoginOrEmail(email);
      if (!user || user.emailConfirmation.isConfirmed) {
        return res.status(HttpStatuses.BadRequest).send({
          errorsMessages: [
            {
              field: "email",
              message: "Email is already confirmed or invalid",
            },
          ],
        });
      }

      const newCode = randomUUID();
      user.emailConfirmation.confirmationCode = newCode;

      const isUpdated = await usersRepository.update(user);
      if (!isUpdated) {
        return res.status(HttpStatuses.ServerError).send({
          errorsMessages: [
            { field: "email", message: "Failed to resend confirmation email" },
          ],
        });
      }

      nodemailerService
        .sendEmail(user.email, newCode, emailExamples.registrationEmail)
        .then((result) => console.log(result));

      return res.sendStatus(HttpStatuses.NoContent);
    } catch (error) {
      // console.error("Error during email resending:", error);
      return res.sendStatus(HttpStatuses.ServerError);
    }
  },
);

authRouter.post(
  routersPaths.auth.login,
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  loginLimiter,
  async (req: RequestWithBody<LoginInputDto>, res: Response) => {
    const { loginOrEmail, password } = req.body;

    const result = await authService.loginUser({
      loginOrEmail: loginOrEmail,
      password: password,
      ip: req.ip as string,
      userAgent: req.headers["user-agent"] as string,
    });

    if (!resultHelpers.isSuccess(result)) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }

    // if (result.status !== ResultStatus.Success) {
    //   return res
    //     .status(resultCodeToHttpException(result.status))
    //     .send(result.extensions);
    // }

    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return res
      .status(HttpStatuses.Success)
      .send({ accessToken: result.data.accessToken });
  },
);

authRouter.post(
  routersPaths.auth.logout,
  refreshTokenGuard,
  async (req, res) => {
    try {
      const { refreshToken } = req.cookies;

      const result = await authService.logOutUser(refreshToken);

      if (!resultHelpers.isSuccess(result)) {
        res.sendStatus(resultHelpers.resultCodeToHttpException(result.status));
        return;
      }

      await blacklistRepository.addToken(refreshToken);

      res.clearCookie("refreshToken");
      return res.sendStatus(HttpStatuses.NoContent);
    } catch (error) {
      return res.sendStatus(HttpStatuses.ServerError);
    }
  },
);

authRouter.get(
  routersPaths.auth.me,
  accessTokenGuard,
  async (req: RequestWithUserId<IdType>, res: Response) => {
    const userId = req.user?.id as string;

    if (!userId) return res.sendStatus(HttpStatuses.Unauthorized);
    const me = await usersQwRepository.findByIdMe(userId);

    return res.status(HttpStatuses.Success).send(me);
  },
);

authRouter.post(
  routersPaths.auth.refreshToken,
  refreshTokenGuard,
  async (req: RequestWithBody<{ refreshToken: string }>, res: Response) => {
    try {
      const { refreshToken } = req.cookies;
      const result = await jwtService.verifyToken(
        refreshToken,
        appConfig.RT_SECRET,
      );

      // console.log(decodedToken, " decodedToken");
      const deviceId = result.data?.deviceId!;
      const userId = result.data?.userId!;
      // if (!decodedToken.data) return res.sendStatus(401);
      // console.log("before found session");
      // const foundSession = await deviceRepository.doesSessionExists(
      //   decodedToken!.data!,
      // );
      // console.log(foundSession, " foundSession");
      // if (!foundSession) return res.sendStatus(401);
      const newAccessToken = await jwtService.createToken(userId);
      const newRefreshToken = await jwtService.createRefreshToken(
        userId,
        deviceId,
      );
      const decodedNewToken = (await jwtService.decodeToken(
        newRefreshToken,
      )) as Record<string, number>;
      const updatedSession = {
        user_id: userId,
        device_id: deviceId,
        iat: decodedNewToken.iat!,
        exp: decodedNewToken.exp!,
      };
      await deviceRepository.updateSession(updatedSession);
      await blacklistRepository.addToken(refreshToken);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 20 * 1000,
        sameSite: "strict",
      });

      return res
        .status(HttpStatuses.Success)
        .send({ accessToken: newAccessToken });
    } catch (error) {
      console.log(error, " errro");
      return res.status(HttpStatuses.ServerError).send({
        errorMessage: "Internal server error",
      });
    }
  },
);
