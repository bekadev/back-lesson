import {ObjectId, WithId} from "mongodb";
import {usersCollection} from "../../db/mongo-db";
import {IUserDB} from "./types/user.db.interface";


export const usersRepository = {
	async create(user: IUserDB): Promise<string> {
		const newUser = await usersCollection.insertOne({...user});
		return newUser.insertedId.toString();
	},
	async delete(id: string): Promise<boolean> {
		if (!this._checkObjectId(id)) return false;
		const isDel = await usersCollection.deleteOne({_id: new ObjectId(id)});
		return isDel.deletedCount === 1;
	},
	async findById(id: string): Promise<WithId<IUserDB> | null> {
		if (!this._checkObjectId(id)) return null;
		return usersCollection.findOne({_id: new ObjectId(id)});

	},
	async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<IUserDB> | null> {
		return usersCollection.findOne({
			$or: [{email: loginOrEmail}, {login: loginOrEmail}],
		});

	},
	async doesExistById(id: string): Promise<boolean> {
		if (!this._checkObjectId(id)) return false;
		const isUser = await usersCollection.findOne({_id: new ObjectId(id)});
		return !!isUser
	},
	_checkObjectId(id: string): boolean {
		return ObjectId.isValid(id)
	},


};
