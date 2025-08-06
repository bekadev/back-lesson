import { Router } from "express";
import { inputCheckErrorsMiddleware } from "../../common/middleware/input-check-errors-middleware";
import { routersPaths } from "../../common/path/paths";
import { inputValidation } from "../../common/validation/input.validation";
import {
  emailValidation,
  emailResendValidation,
} from "../users/middlewares/email.validation";
import { loginOrEmailValidation } from "../users/middlewares/login.or.emaol.validation";
import { loginValidation } from "../users/middlewares/login.validation";
import { passwordValidation } from "../users/middlewares/password.validation";
import { accessTokenGuard } from "./guards/access.token.guard";
import { refreshTokenGuard } from "./guards/refresh.token.guard";
import { codeValidation } from "./middlewares/code.validation";
import {
  registrationLimiter,
  emailLimiter,
  loginLimiter,
} from "./middlewares/login.limiter";
import { authController } from "./controllers";

export const authRouter = Router();

authRouter.post(
  routersPaths.auth.registration,
  registrationLimiter,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputCheckErrorsMiddleware,
  authController.registerUser.bind(authController),
);

authRouter.post(
  routersPaths.auth.registrationConfirmation,
  registrationLimiter,
  codeValidation,
  inputCheckErrorsMiddleware,
  authController.confirmEmail.bind(authController),
);

authRouter.post(
  routersPaths.auth.registrationEmailResending,
  emailLimiter,
  emailResendValidation,
  inputCheckErrorsMiddleware,
  authController.resendEmail.bind(authController),
);

authRouter.post(
  routersPaths.auth.login,
  loginLimiter,
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  authController.loginUser.bind(authController),
);

authRouter.post(
  "/logout",
  refreshTokenGuard,
  authController.logOutUser.bind(authController),
);

authRouter.get(
  routersPaths.auth.me,
  accessTokenGuard,
  authController.getMe.bind(authController),
);

authRouter.post(
  "/refresh-token",
  // routersPaths.auth.refreshToken,
  refreshTokenGuard,
  // refreshTokenMiddleware,
  authController.refreshToken.bind(authController),
);
