import {type WithId, ObjectId} from "mongodb";
import type {CommentsEntityModel} from "../../common/input-output-types/comments-types";
import {commentsCollection} from "../../db/mongo-db";

export const commentsRepository = {
	async find(id: string): Promise<WithId<CommentsEntityModel> | null> {
		return await commentsCollection.findOne({_id: new ObjectId(id)})
	},
	async del(id: string): Promise<boolean> {
		const result = await commentsCollection.deleteOne({_id: new ObjectId(id)})
		return result.deletedCount == 1
	},
	async put(updatedComment: any, id: string): Promise<boolean> {
		const result = await commentsCollection.updateOne({_id: new ObjectId(id)}, {$set: updatedComment})
		return !!result.modifiedCount;
	},
}