import { Request, Response, Router } from "express";
import { routersPaths } from "../../common/path/paths";
import { ResultStatus } from "../../common/result/resultCode";
import { resultCodeToHttpException } from "../../common/result/resultCodeToHttpException";
import { HttpStatuses } from "../../common/types/httpStatuses";
import type { IdType } from "../../common/types/id";
import type {
  RequestWithBody,
  RequestWithUserId,
} from "../../common/types/requests";
import { inputValidation } from "../../common/validation/input.validation";
import { emailValidation } from "../users/middlewares/email.validation";
import { loginOrEmailValidation } from "../users/middlewares/login.or.emaol.validation";
import { loginValidation } from "../users/middlewares/login.validation";
import { passwordValidation } from "../users/middlewares/password.validation";
import { CreateUserInputDto } from "../users/types/create.user.input.dto";
import { usersQwRepository } from "../users/user.query.repository";
import { authService } from "./auth.service";
import { accessTokenGuard } from "./guards/access.token.guard";
import { LoginInputDto } from "./types/login.input.dto";

export const authRouter = Router();

authRouter.post(
  routersPaths.auth.login,
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  async (req: RequestWithBody<LoginInputDto>, res: Response) => {
    const { loginOrEmail, password } = req.body;

    const result = await authService.loginUser(loginOrEmail, password);

    //TODO: replace with type guard
    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .send(result.extensions);
    }

    return res
      .status(HttpStatuses.Success)
      .send({ accessToken: result.data!.accessToken });
  },
);

authRouter.get(
  routersPaths.auth.me,
  accessTokenGuard,
  async (req: RequestWithUserId<IdType>, res: Response) => {
    const userId = req.user?.id as string;

    if (!userId) return res.sendStatus(HttpStatuses.Unauthorized);
    const me = await usersQwRepository.findById(userId);

    return res.status(HttpStatuses.Success).send(me);
  },
);

authRouter.post(
  routersPaths.auth.registration,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputValidation,
  async (req: RequestWithBody<CreateUserInputDto>, res: Response) => {
    const { login, email, password } = req.body;

    const result = await authService.registerUser(login, password, email);
    if (result.status === ResultStatus.Success) {
      return res.send(HttpStatuses.Created).json(result);
    }
    return res.sendStatus(HttpStatuses.Created);
  },
);

authRouter.post(
  routersPaths.auth.registrationConfirmation,
  inputValidation,
  async (req: Request, res: Response) => {
    const { code } = req.body;
    //some logic

    return res.sendStatus(HttpStatuses.Created);
  },
);

authRouter.post(
  routersPaths.auth.registrationEmailResending,
  inputValidation,
  async (req: Request, res: Response) => {
    const { email } = req.body;
    //some logic

    return res.sendStatus(HttpStatuses.Created);
  },
);
