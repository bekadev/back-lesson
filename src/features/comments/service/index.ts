import {PostDbType} from "../../../db/post-db-type";
import {commentsRepository} from "../commentsRepository";

export const commentsService = {
	async find(id: string): Promise<PostDbType | null> {
		return await commentsRepository.find(id)
	},
	async del(id: string): Promise<boolean> {
		return await commentsRepository.del(id);
	},
	async put(post: any, id: string) {
		return 1
	},
}
