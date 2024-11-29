import type {WithId} from "mongodb";
import type {CommentsViewModel, CommentsEntityModel} from "../../../common/input-output-types/comments-types";
import {commentsRepository} from "../commentsRepository";

export const commentsService = {
	async find(id: string): Promise<CommentsViewModel | null> {
		const comments = await commentsRepository.find(id)
		return comments ? this.map(comments) : null;

	},
	async del(id: string): Promise<boolean> {
		return await commentsRepository.del(id);
	},
	async put(comment: any, id: string): Promise<{ content: string } | null> {
		const existingComment = await commentsRepository.find(id);
		if (!existingComment) return null;

		const updatedComment = {
			...existingComment,
			content: comment.content
		};

		const result = await commentsRepository.put(updatedComment, id);
		if (result) {
			return this.map(updatedComment)
		} else {
			throw new Error()
		}
	},
	map(comment: WithId<CommentsEntityModel>): CommentsViewModel {
		return {
			id: comment._id.toString(),
			commentatorInfo: comment.commentatorInfo,
			content: comment.content,
			createdAt: comment.createdAt,
		};
	},
}
