import { Response } from "express";
import { IPagination } from "../../../common/types/pagination";
import { RequestWithBody, RequestWithParams, RequestWithQuery } from "../../../common/types/requests";
import { IUserView } from "../types/user.view.interface";
import { UsersQueryFieldsType } from "../types/users.queryFields.type";
import { usersQwRepository } from "../user.query.repository";
import { CreateUserInputDto } from "../types/create.user.input.dto";
import { IdType } from "../../../common/types/id";
import { sortQueryFieldsUtil } from "../../../common/utils/sortQueryFields.util";
import { UsersService } from "../user.service";

export class UsersController {
	usersService: UsersService
	constructor() {
		this.usersService = new UsersService()
	}

	async getUsersController(req: RequestWithQuery<UsersQueryFieldsType>, res: Response<IPagination<IUserView[]>>) {
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

	async createUserController(req: RequestWithBody<CreateUserInputDto>, res: Response<IUserView | {
		errorsMessages: { field: string, message: string }[]
	}>) {
		const result = await this.usersService.create(req.body);

		if (result.success) {
			const newUser = await usersQwRepository.findById(result.userId);
			return res.status(201).send(newUser!);
		}

		return res.status(400).send({errorsMessages: result.errorsMessages});
	}

	async deleteUserController(req: RequestWithParams<IdType>, res: Response<string>) {
		const user = await this.usersService.delete(req.params.id);

		if (!user) return res.sendStatus(404);

		return res.sendStatus(204);
	}
}

export const usersController = new UsersController()