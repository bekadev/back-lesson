import {Response, Router} from "express";
import {resultCodeToHttpException} from "../common/result/resultCodeToHttpException";
import {HttpStatuses} from "../common/types/httpStatuses";
import type {IdType} from "../common/types/id";
// import {routersPaths} from "../common/path/paths";
import {RequestWithBody, type RequestWithUserId} from "../common/types/requests";
import {ResultStatus} from "../common/types/resultCode";
import {loginOrEmailValidation} from "../features/users/middlewares/login.or.emaol.validation";
import {passwordValidation} from "../features/users/middlewares/password.validation";
import {usersQwRepository} from "../features/users/user.query.repository";
import {inputCheckErrorsMiddleware} from "../middleware/input-check-errors-middleware";

import {authService} from "./auth.service";
import {accessTokenGuard} from "./guards/access.token.guard";
import {LoginInputDto} from "./types/login.input.dto";

export const authRouter = Router();

authRouter.post('/auth/login',
	passwordValidation,
	loginOrEmailValidation,
	inputCheckErrorsMiddleware,
	async (req: RequestWithBody<LoginInputDto>, res: Response) => {
		const {loginOrEmail, password} = req.body;

		const result = await authService.loginUser(loginOrEmail, password);

		if (result.status !== ResultStatus.Success) {
			return res
			.status(resultCodeToHttpException(result.status))
			.send(result.extensions);
		}

		return res
		.status(HttpStatuses.Success)
		.send({accessToken: result.data!.accessToken});
	},
);

authRouter.get(
	'/auth/me',
	accessTokenGuard,
	async (req: RequestWithUserId<IdType>, res: Response) => {
		const userId = req.user?.id as string;

		if (!userId) return res.sendStatus(HttpStatuses.Unauthorized);
		const me = await usersQwRepository.findById(userId);

		return res.status(HttpStatuses.Success).send(me);
	},
);