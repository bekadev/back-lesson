import {ObjectId, WithId} from "mongodb";

import type {IPagination} from "../../common/types/pagination";
import type {SortQueryFilterType} from "../../common/types/sortQueryFilter.type";
import {usersCollection} from "../../db/mongo-db";
import {IUserDB} from "./types/user.db.interface";
import {IUserView} from "./types/user.view.interface";

export const usersQwRepository = {
	async findAllUsers(sortQueryDto: SortQueryFilterType & {
		searchLoginTerm?: string;
		searchEmailTerm?: string;
	}): Promise<IPagination<IUserView[]>> {
		const {sortBy, sortDirection, pageSize, pageNumber, searchLoginTerm, searchEmailTerm} = sortQueryDto;

		const loginAndEmailFilter: any = {
			$or: [
				{
					login: {$regex: searchLoginTerm ?? '', $options: "i"}
				},
				{
					email: {
						$regex: searchEmailTerm ?? '',
						$options: "i"
					}
				}]
		};

		const totalCount = await usersCollection.countDocuments(loginAndEmailFilter);

		const users = await usersCollection
		.find(loginAndEmailFilter)
		.sort({[sortBy]: sortDirection})
		.skip((pageNumber - 1) * pageSize)
		.limit(pageSize)
		.toArray();

		return {
			pagesCount: Math.ceil(totalCount / pageSize),
			page: pageNumber,
			pageSize: pageSize,
			totalCount,
			items: users.map((u: WithId<IUserDB>) => this._getInView(u)),
		};
	},
	async findById(id: string): Promise<IUserView | null> {
		if (!this._checkObjectId(id)) return null;
		const user = await usersCollection.findOne({_id: new ObjectId(id)});
		return user ? this._getInView(user) : null;
	},
	_getInView(user: WithId<IUserDB>): IUserView {
		return {
			id: user._id.toString(),
			login: user.login,
			email: user.email,
			createdAt: user.createdAt.toISOString(),
		};
	},
	_checkObjectId(id: string): boolean {
		return ObjectId.isValid(id)
	}

};