import {ObjectId} from "mongodb";
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
			id: new Date().toISOString() + Math.random(),
			title: post.title,
			content: post.content,
			shortDescription: post.shortDescription,
			blogId: blog!._id.toString(),
			blogName: blog!.name,
			createdAt: new Date().toISOString(),
		}

		const newPostId = await postsRepository.create(newPost)
		const createdPost = await this.find(newPostId);
		return createdPost ? this.map(createdPost) : null;
	},
	async find(id: string): Promise<PostDbType | null> {
		return await postsRepository.find(id)
	},
	// async findAndMap(id: string): Promise<PostViewModel | undefined> {
	// 	const post = await this.find(id)! // ! используем этот метод если проверили существование
	// 	if (!post) return undefined
	//
	// 	return this.map(post)
	// },
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
			items: posts.map(p => this.map(p))
		}
	},
	async del(id: string): Promise<boolean> {
		return await postsRepository.del(id);
	},
	async put(post: PostInputModel, id: string): Promise<PostViewModel | null> {
		const blog = await blogsRepository.find(post.blogId);
		if (!blog) return null;

		const existingPost = await this.find(id)
		if (!existingPost) return null;

		const updatedPost = {
			...existingPost,
			title: post.title,
			shortDescription: post.shortDescription,
			blogId: blog._id.toString(),
			content: post.content
		};

		const result = await postsRepository.put(updatedPost, id)
		return result ? this.map(result) : null;
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
	map(post: PostDbType) {
		const postForOutput: PostViewModel = {
			id: post.id,
			title: post.title,
			shortDescription: post.shortDescription,
			content: post.content,
			blogId: post.blogId,
			blogName: post.blogName,
			createdAt: post.createdAt,
		}
		return postForOutput
	},
}
