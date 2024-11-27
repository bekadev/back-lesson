import {ObjectId, WithId} from "mongodb";
import type {
	CommentsInputModel,
	CommentsViewModel,
	CommentsPaginationViewModel
} from "../../../common/input-output-types/comments-types";
import {
	PostInputModel,
	PostViewModel,
	type PostsPaginationViewModel
} from "../../../common/input-output-types/posts-types";
import {PostDbType} from "../../../db/post-db-type";
import {blogsRepository} from "../../blogs/blogsRepository";
import {postsRepository} from "../postsRepository";

export const postsService = {
	async create(post: PostInputModel): Promise<PostViewModel | null> {
		const blog = await blogsRepository.find(post.blogId)
		const newPost: PostDbType = {
			title: post.title,
			content: post.content,
			shortDescription: post.shortDescription,
			blogId: blog!._id.toString(),
			blogName: blog!.name,
			createdAt: new Date().toISOString(),
		}

		const newPostId = await postsRepository.create(newPost)
		const createdPost = await postsRepository.find(newPostId);
		return createdPost ? this.map(createdPost) : null;
	},
	async find(id: string): Promise<PostViewModel | null> {
		const result = await postsRepository.find(id)
		return result ? this.map(result) : null;
	},
	async getAll(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: 'desc' | 'asc',
	): Promise<PostsPaginationViewModel> {
		const posts = await postsRepository.getAll(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
		)
		const postsCount = await postsRepository.getBlogsCount()
		return {
			pagesCount: Math.ceil(postsCount / pageSize),
			page: pageNumber,
			pageSize: pageSize,
			totalCount: postsCount,
			items: posts
		}
	},
	async del(id: string): Promise<boolean> {
		return await postsRepository.del(id);
	},
	async put(post: PostInputModel, id: string): Promise<PostViewModel | null> {
		const blog = await blogsRepository.find(post.blogId);
		if (!blog) return null;

		const existingPost = await postsRepository.find(id)
		if (!existingPost) return null;

		const updatedPost = {
			...existingPost,
			title: post.title,
			shortDescription: post.shortDescription,
			blogId: blog._id.toString(),
			content: post.content
		};

		const result = await postsRepository.put(updatedPost, id)
		if (result) {
			return this.map(updatedPost)
		} else {
			throw new Error()
		}
	},
	async createCommentsForPost(postId: string, comments: CommentsInputModel): Promise<CommentsViewModel | null> {
		const postExists = await this.find(postId);
		if (!postExists) return null;

		const newComments = {
			id: ObjectId.toString(),
			content: comments.content,
			commentatorInfo: {
				userId: "",
				userLogin: ""
			},
			createdAt: new Date().toISOString()
		};

		const isCreated = await postsRepository.createCommentsForPost(newComments);
		return isCreated ? {
			id: newComments.id,
			content: newComments.content,
			commentatorInfo: {
				userId: newComments.commentatorInfo.userId,
				userLogin: newComments.commentatorInfo.userLogin
			},
			createdAt: newComments.createdAt
		} : null;
	},
	async getComments(postId: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 'desc' | 'asc'): Promise<CommentsPaginationViewModel> {
		const posts = await postsRepository.getComments(postId, pageNumber, pageSize, sortBy, sortDirection);
		const totalPostsCount = await postsRepository.getCommentsForPost(postId);
		return {
			pagesCount: Math.ceil(totalPostsCount / pageSize),
			page: pageNumber,
			pageSize: pageSize,
			totalCount: totalPostsCount,
			items: posts,
		};
	},
	map(post: WithId<PostDbType>): PostViewModel {
		return {
			id: post._id.toString(),
			title: post.title,
			shortDescription: post.shortDescription,
			content: post.content,
			blogId: post.blogId,
			blogName: post.blogName,
			createdAt: post.createdAt,
		}
	},
}
