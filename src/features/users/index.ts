import {Router} from "express";
import {adminMiddleware} from "../../common/middleware/auth-middleware";
import {inputCheckErrorsMiddleware} from "../../common/middleware/input-check-errors-middleware";
import {pageNumberValidation} from "../../common/validation/sorting.pagination.validation";
import {baseAuthGuard} from "../auth/guards/base.auth.guard";
import {emailValidation} from "./middlewares/email.validation";
import {loginValidation} from "./middlewares/login.validation";
import {passwordValidation} from "./middlewares/password.validation";
import { usersController } from "./compositions-root";

export const usersRouter = Router()


usersRouter.get(
	"/",
	adminMiddleware,
	baseAuthGuard,
	pageNumberValidation,
	usersController.getUsersController.bind(usersController)
);

usersRouter.post(
	"/",
	adminMiddleware,
	baseAuthGuard,
	passwordValidation,
	loginValidation,
	emailValidation,
	inputCheckErrorsMiddleware,
	usersController.createUserController.bind(usersController)
);


usersRouter.delete(
	"/:id",
	adminMiddleware,
	usersController.deleteUserController.bind(usersController)
);

