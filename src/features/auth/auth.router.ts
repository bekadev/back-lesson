import {Response, Router} from "express";
import {routersPaths} from "../../common/path/paths";
import {resultCodeToHttpException} from "../../common/result/resultCodeToHttpException";
import {HttpStatuses} from "../../common/types/httpStatuses";
import type {IdType} from "../../common/types/id";
import {RequestWithBody, type RequestWithUserId} from "../../common/types/requests";
import {ResultStatus} from "../../common/types/resultCode";
import {inputValidation} from "../../common/validation/input.validation";
import {loginOrEmailValidation} from "../users/middlewares/login.or.emaol.validation";
import {passwordValidation} from "../users/middlewares/password.validation";
import {usersQwRepository} from "../users/user.query.repository";

import {authService} from "./auth.service";
import {accessTokenGuard} from "./guards/access.token.guard";
import {LoginInputDto} from "./types/login.input.dto";

export const authRouter = Router();

authRouter.post(
	routersPaths.auth.login,
	passwordValidation,
	loginOrEmailValidation,
	inputValidation,
	async (req: RequestWithBody<LoginInputDto>, res: Response) => {
		const {loginOrEmail, password} = req.body;

		const result = await authService.loginUser(loginOrEmail, password);
		console.log(result)

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
	routersPaths.auth.me,
	accessTokenGuard,
	async (req: RequestWithUserId<IdType>, res: Response) => {
		const userId = req.user?.id as string;

		if (!userId) return res.sendStatus(HttpStatuses.Unauthorized);
		const me = await usersQwRepository.findById(userId);

		return res.status(HttpStatuses.Success).send(me);
	},
);