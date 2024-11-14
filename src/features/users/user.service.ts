import {bcryptService} from "../../common/adapters/bcrypt.service";
import {CreateUserInputDto} from "./types/create.user.input.dto";
import {IUserDB} from "./types/user.db.interface";
import {usersRepository} from "./user.repository";

type CreateUserResult =
	| { success: true; userId: string } // Success case
	| { success: false; errorsMessages: { field: string; message: string }[] }; // Error case

export const usersService = {
	async create(dto: CreateUserInputDto): Promise<CreateUserResult> {
		const {login, password, email} = dto;

		// Check if a user with the same login or email already exists
		const existingUserByLogin = await usersRepository.findByLoginOrEmail(login);
		if (existingUserByLogin) {
			return {
				success: false,
				errorsMessages: [{field: 'login', message: 'login should be unique'}]
			};
		}

		const existingUserByEmail = await usersRepository.findByLoginOrEmail(email);
		if (existingUserByEmail) {
			return {
				success: false,
				errorsMessages: [{field: 'email', message: 'email should be unique'}]
			};
		}

		// If unique, create the user
		const passwordHash = await bcryptService.generateHash(password);
		const newUser: IUserDB = {
			login,
			email,
			passwordHash,
			createdAt: new Date(),
		};

		const userId = await usersRepository.create(newUser);
		return {success: true, userId};
	},

	// async create(dto: CreateUserInputDto): Promise<string> {
	// 	const {login, password, email} = dto
	// 	const passwordHash = await bcryptService.generateHash(password)
	//
	// 	const newUser: IUserDB = {
	// 		login,
	// 		email,
	// 		passwordHash,
	// 		createdAt: new Date(),
	//
	// 	};
	// 	return await usersRepository.create(newUser);
	// },

	// async create(dto: CreateUserInputDto): Promise<string> {
	// 	const {login, password, email} = dto
	// 	const passwordHash = await bcryptService.generateHash(password)
	//
	// 	const newUser: IUserDB = {
	// 		login,
	// 		email,
	// 		passwordHash,
	// 		createdAt: new Date(),
	//
	// 	};
	// 	return await usersRepository.create(newUser);
	// },

	async delete(id: string): Promise<boolean> {
		const user = await usersRepository.findById(id);
		if (!user) return false;

		return await usersRepository.delete(id);


	},
}

