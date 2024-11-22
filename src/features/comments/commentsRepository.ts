import {commentsCollection} from "../../db/mongo-db";
import {PostDbType} from "../../db/post-db-type";

export const commentsRepository = {
	async find(id: string): Promise<PostDbType | null> {
		return await commentsCollection.findOne({id: id}, {projection: {_id: 0}})
	},
	async del(id: string): Promise<boolean> {
		const result = await commentsCollection.deleteOne({id: id})
		return result.deletedCount == 1
	},
	async put(updatedPost: PostDbType, id: string): Promise<PostDbType | null> {
		const result = await commentsCollection.updateOne({id: id}, {$set: updatedPost})
		return result.modifiedCount === 1 ? updatedPost : null;
	},
}