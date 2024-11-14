import {Response, Router} from "express";
// import {routersPaths} from "../common/path/paths";
import {RequestWithBody} from "../common/types/requests";
import {loginOrEmailValidation} from "../features/users/middlewares/login.or.emaol.validation";
import {passwordValidation} from "../features/users/middlewares/password.validation";
import {inputCheckErrorsMiddleware} from "../middleware/input-check-errors-middleware";

import {authService} from "./auth.service";
import {LoginInputDto} from "./types/login.input.dto";

export const authRouter = Router()

authRouter.post('/',
	passwordValidation,
	loginOrEmailValidation,
	inputCheckErrorsMiddleware,
	async (req: RequestWithBody<LoginInputDto>, res: Response) => {
		const {loginOrEmail, password} = req.body

		const accessToken = await authService.loginUser(
			loginOrEmail,
			password
		);
		if (!accessToken) return res.sendStatus(401);

		return res.status(204).send({accessToken});
	})
