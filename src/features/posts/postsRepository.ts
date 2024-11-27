import {type WithId, ObjectId} from "mongodb";
import type {PostEntityModel, PostViewModel} from "../../common/input-output-types/posts-types";
import {postCollection, commentsCollection} from "../../db/mongo-db";
import {PostDbType} from "../../db/post-db-type";

export const postsRepository = {
	async create(post: PostEntityModel): Promise<string> {
		const result = await postCollection.insertOne(post)
		return result.insertedId.toString()
	},
	async find(id: string): Promise<WithId<PostEntityModel> | null> {
		return await postCollection.findOne({_id: new ObjectId(id)})
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
	async getBlogsCount(): Promise<number> {
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
		await postCollection.insertOne(comments);
		return comments.id;
	},
	async getComments(blogId: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 'desc' | 'asc') {
		const posts = await commentsCollection
		.find({blogId})
		.skip((pageNumber - 1) * pageSize)
		.limit(pageSize)
		.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
		.toArray();

		return posts.map(post => {
			return {
				id: post.id,
				content: post.content,
				commentatorInfo: {
					userId: post.commentatorInfo.userId,
					userLogin: post.commentatorInfo.userLogin
				},
				createdAt: post.createdAt
			}
		})
	},
	async getCommentsForPost(postId: string): Promise<number> {
		return await commentsCollection.countDocuments({postId});
	},
}