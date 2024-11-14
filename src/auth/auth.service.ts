import {WithId} from "mongodb";
import {bcryptService} from "../common/adapters/bcrypt.service";
import type {IUserDB} from "../features/users/types/user.db.interface";
import {usersRepository} from "../features/users/user.repository";

export const authService = {

	async loginUser(loginOrEmail: string, password: string): Promise<WithId<IUserDB> | null> {
		return this.checkUserCredentials(loginOrEmail, password);
	},

	async checkUserCredentials(loginOrEmail: string, password: string): Promise<WithId<IUserDB> | null> {
		const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
		if (!user) return null;

		const isPassCorrect = await bcryptService.checkPassword(password, user.passwordHash);
		if (!isPassCorrect) return null;

		return user
	},


}
