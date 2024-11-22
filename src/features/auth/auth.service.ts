import {WithId} from "mongodb";
import {bcryptService} from "../../common/adapters/bcrypt.service";
import {jwtService} from "../../common/adapters/jwt.service";
import {Result} from "../../common/result/result.type";
import {ResultStatus} from "../../common/result/resultCode";
import type {IUserDB} from "../users/types/user.db.interface";
import {usersRepository} from "../users/user.repository";

export const authService = {
	async loginUser(
		loginOrEmail: string,
		password: string,
	): Promise<Result<{ accessToken: string } | null>> {
		const result = await this.checkUserCredentials(loginOrEmail, password);
		if (result.status !== ResultStatus.Success)
			return {
				status: ResultStatus.Unauthorized,
				errorMessage: "Unauthorized",
				extensions: [{field: "loginOrEmail", message: "Wrong credentials"}],
				data: null,
			};

		const accessToken = await jwtService.createToken(
			result.data!._id.toString(),
		);

		return {
			status: ResultStatus.Success,
			data: {accessToken},
			extensions: [],
		};
	},

	async checkUserCredentials(
		loginOrEmail: string,
		password: string,
	): Promise<Result<WithId<IUserDB> | null>> {
		const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
		if (!user)
			return {
				status: ResultStatus.NotFound,
				data: null,
				errorMessage: "Not Found",
				extensions: [{field: "loginOrEmail", message: "Not Found"}],
			};

		const isPassCorrect = await bcryptService.checkPassword(
			password,
			user.passwordHash,
		);
		if (!isPassCorrect)
			return {
				status: ResultStatus.BadRequest,
				data: null,
				errorMessage: "Bad Request",
				extensions: [{field: "password", message: "Wrong password"}],
			};

		return {
			status: ResultStatus.Success,
			data: user,
			extensions: [],
		};
	},
};