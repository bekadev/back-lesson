import {type WithId, ObjectId} from "mongodb";
import type {CommentsEntityModel} from "../../common/input-output-types/comments-types";
import type {PostEntityModel, PostViewModel} from "../../common/input-output-types/posts-types";
import {postCollection, commentsCollection} from "../../db/mongo-db";
import {PostDbType} from "../../db/post-db-type";

export const postsRepository = {
	async create(post: PostEntityModel): Promise<string> {
		const result = await postCollection.insertOne(post)
		return result.insertedId.toString()
	},
	async find(id: string): Promise<WithId<PostEntityModel> | null> {
		return postCollection.findOne({_id: new ObjectId(id)})
	},
	async getAll(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: 'desc' | 'asc',
	): Promise<PostViewModel[]> {
		const posts = await postCollection
		.find()
		.skip((pageNumber - 1) * pageSize)
		.limit(pageSize)
		.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
		.toArray();

		return posts.map((post) => {
			return {
				id: post._id.toString(),
				title: post.title,
				content: post.content,
				blogId: post.blogId,
				blogName: post.blogName,
				createdAt: post.createdAt,
				shortDescription: post.shortDescription
			}
		});
	},
	async getPostsCount(): Promise<number> {
		const filter: any = {}
		filter.title = {$regex: '', $options: 'i'};
		return postCollection.countDocuments(filter)
	},
	async del(id: string): Promise<boolean> {
		const result = await postCollection.deleteOne({_id: new ObjectId(id)})
		return result.deletedCount == 1
	},
	async put(updatedPost: PostDbType, id: string): Promise<boolean> {
		const result = await postCollection.updateOne({_id: new ObjectId(id)}, {$set: updatedPost});
		return !!result.modifiedCount;

	},
	async createCommentsForPost(comments: any): Promise<string> {
		const result = await commentsCollection.insertOne(comments);
		return result.insertedId.toString();
	},
	async getComments(postId: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 'desc' | 'asc') {
		const comments = await commentsCollection
		.find({postId})
		.skip((pageNumber - 1) * pageSize)
		.limit(pageSize)
		.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
		.toArray();

		return comments.map((comment: WithId<CommentsEntityModel>) => {
			return {
				id: comment._id.toString(),
				content: comment.content,
				commentatorInfo: {
					userId: comment.commentatorInfo.userId,
					userLogin: comment.commentatorInfo.userLogin
				},
				createdAt: comment.createdAt
			}
		})
	},
	async getCommentsForPost(postId: string): Promise<number> {
		return await commentsCollection.countDocuments({postId});
	},
}