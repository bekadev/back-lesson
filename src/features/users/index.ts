import {Router, Response} from "express";
import type {IdType} from "../../common/types/id";
import type {IPagination} from "../../common/types/pagination";
import type {RequestWithQuery, RequestWithBody, RequestWithParams} from "../../common/types/requests";
import {sortQueryFieldsUtil} from "../../common/utils/sortQueryFields.util";
import {pageNumberValidation} from "../../common/validation/sorting.pagination.validation";
import {adminMiddleware} from "../../middleware/auth-middleware";
import {inputCheckErrorsMiddleware} from "../../middleware/input-check-errors-middleware";
import {emailValidation} from "./middlewares/email.validation";
import {loginValidation} from "./middlewares/login.validation";
import {passwordValidation} from "./middlewares/password.validation";
import type {CreateUserInputDto} from "./types/create.user.input.dto";
import type {IUserView} from "./types/user.view.interface";
import type {UsersQueryFieldsType} from "./types/users.queryFields.type";
import {usersQwRepository} from "./user.query.repository";
import {usersService} from "./user.service";


export const usersRouter = Router()


usersRouter.get(
	"/",
	adminMiddleware,
	pageNumberValidation,
	async (
		req: RequestWithQuery<UsersQueryFieldsType>,
		res: Response<IPagination<IUserView[]>>
	) => {
		const {
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			searchLoginTerm,
			searchEmailTerm
		} = sortQueryFieldsUtil(req.query);

		const allUsers = await usersQwRepository.findAllUsers({
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			searchLoginTerm,
			searchEmailTerm,
		});

		return res.status(200).send(allUsers);
	}
);


// usersRouter.post(
// 	"/",
// 	adminMiddleware,
// 	passwordValidation,
// 	loginValidation,
// 	emailValidation,
// 	inputCheckErrorsMiddleware,
// 	async (req: RequestWithBody<CreateUserInputDto>, res: Response<IUserView>) => {
// 		const {login, password, email} = req.body
//
// 		const userId = await usersService.create({login, password, email});
// 		const newUser = await usersQwRepository.findById(userId);
//
// 		return res.status(201).send(newUser!);
// 	}
// );

usersRouter.post(
	"/",
	adminMiddleware,
	passwordValidation,
	loginValidation,
	emailValidation,
	inputCheckErrorsMiddleware,
	async (req: RequestWithBody<CreateUserInputDto>, res: Response<IUserView | {
		errorsMessages: { field: string, message: string }[]
	}>) => {
		const result = await usersService.create(req.body);

		// Check if the creation was successful
		if (result.success) {
			// Fetch the newly created user and send it with a 201 status
			const newUser = await usersQwRepository.findById(result.userId);
			return res.status(201).send(newUser!);
		}

		// Otherwise, return a 400 status with the errorsMessages array
		return res.status(400).send({errorsMessages: result.errorsMessages});
	}
);

usersRouter.delete(
	"/:id",
	adminMiddleware,
	async (req: RequestWithParams<IdType>, res: Response<string>) => {

		const user = await usersService.delete(req.params.id);

		if (!user) return res.sendStatus(404);

		return res.sendStatus(204);
	}
);

