import { RequestWithBody } from "../../../common/types/requests";
import { CreateUserInputDto } from "../../users/types/create.user.input.dto";
import { UsersRepository } from "../../users/user.repository";
import { AuthService } from "../auth.service";
import { ResultStatus } from "../../../common/result/resultCode";
import { HttpStatuses } from "../../../common/types/httpStatuses";
import { Response } from "express";
import { randomUUID } from "crypto";
import { nodemailerService } from "../../../common/adapters/nodemailer.service";
import { emailExamples } from "../../../common/adapters/emailExamples";
import { resultHelpers } from "../../../common/result/resultHelpers";
import { blacklistRepository } from "../blacklist.repository";
import { jwtService } from "../../../common/adapters/jwt.service";
import { appConfig } from "../../../common/config/config";
import { DeviceRepository } from "../../session/session.repository";
import { usersQwRepository } from "../../users/user.query.repository";
import { IdType } from "../../../common/types/id";
import { RequestWithUserId } from "../../../common/types/requests";

import { LoginInputDto } from "../types/login.input.dto";


export class AuthController {
    constructor(protected authService: AuthService, protected usersRepository: UsersRepository) {}
    async registerUser(req: RequestWithBody<CreateUserInputDto>, res: Response) {
      const { login, email, password } = req.body;
      const result = await this.authService.registerUser(login, password, email);
      if (result.status === ResultStatus.Success) {
        return res.sendStatus(HttpStatuses.NoContent);
      }
      return res.sendStatus(HttpStatuses.NotFound);
    }
  
    async confirmEmail(req: RequestWithBody<{ code: string }>, res: Response) { 
      const { code } = req.body;
  
      const user = await this.usersRepository.findUserByConfirmationCode(code);
  
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
  
      const isUpdated = await this.usersRepository.update(user);
  
      if (!isUpdated) {
        return res.status(HttpStatuses.ServerError).send({
          errorsMessages: [{ field: "code", message: "Failed to confirm email" }],
        });
      }
  
      return res.sendStatus(HttpStatuses.NoContent);
    } 
  
    async resendEmail(req: RequestWithBody<{ email: string }>, res: Response) {
      const { email } = req.body;
  
      const user = await this.usersRepository.findByLoginOrEmail(email);
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
  
      const isUpdated = await this.usersRepository.update(user);
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
    }
  
    async loginUser(req: RequestWithBody<LoginInputDto>, res: Response) {
      const { loginOrEmail, password } = req.body;
  
      const result = await this.authService.loginUser({
        loginOrEmail: loginOrEmail,
        password: password,
        ip: req.ip as string,
        userAgent: req.headers["user-agent"] as string,
      });
  
      if (!resultHelpers.isSuccess(result)) {
        res.sendStatus(HttpStatuses.Unauthorized);
        return;
      }
  
      res.cookie("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
  
      return res
        .status(HttpStatuses.Success)
        .send({ accessToken: result.data.accessToken });
    }
  
    async logOutUser(req: RequestWithBody<any>, res: Response) {
      try {
        const { refreshToken } = req.cookies;
  
        const result = await this.authService.logOutUser(refreshToken);
  
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
    }
  
    async getMe(req: RequestWithUserId<IdType>, res: Response) {
      const userId = req.user?.id as string;
  
      if (!userId) return res.sendStatus(HttpStatuses.Unauthorized);
      const me = await usersQwRepository.findByIdMe(userId);
  
      return res.status(HttpStatuses.Success).send(me);
    }
  
    async refreshToken(req: RequestWithBody<{ refreshToken: string }>, res: Response) {
      try {
        const { refreshToken } = req.cookies;
        const result = await jwtService.verifyToken(
          refreshToken,
          appConfig.RT_SECRET,
        );
  
        const deviceId = result.data?.deviceId!;
        const userId = result.data?.userId!;
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
        await new DeviceRepository().updateSession(updatedSession);
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
    }
  }
  
  