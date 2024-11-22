import {PostViewModel} from "../../common/input-output-types/posts-types";
import {postCollection, commentsCollection} from "../../db/mongo-db";
import {PostDbType} from "../../db/post-db-type";

export const postsRepository = {
	async create(post: PostDbType): Promise<string> {
		await postCollection.insertOne(post)
		return post.id
	},
	async find(id: string): Promise<PostDbType | null> {
		return await postCollection.findOne({id: id}, {projection: {_id: 0}})
	},
	async getAll(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: 'desc' | 'asc',
	): Promise<PostViewModel[]> {
		return await postCollection
		.find()
		.skip((pageNumber - 1) * pageSize)
		.limit(pageSize)
		.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
		.toArray();
	},
	async getBlogsCount(): Promise<number> {
		const filter: any = {}
		filter.title = {$regex: '', $options: 'i'};
		return postCollection.countDocuments(filter)
	},
	async del(id: string): Promise<boolean> {
		const result = await postCollection.deleteOne({id: id})
		return result.deletedCount == 1
	},
	async put(updatedPost: PostDbType, id: string): Promise<PostDbType | null> {
		const result = await postCollection.updateOne({id: id}, {$set: updatedPost})
		return result.modifiedCount === 1 ? updatedPost : null;
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