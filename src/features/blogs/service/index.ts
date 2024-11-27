import {type WithId} from "mongodb";
import type {
	BlogInputModel,
	BlogViewModel,
	BlogsPaginationViewModel
} from "../../../common/input-output-types/blogs-types";
import type {
	PostInputModel,
	PostViewModel,
	PostsPaginationViewModel
} from "../../../common/input-output-types/posts-types";
import type {BlogDbType} from "../../../db/blog-db-type";
import type {PostDbType} from "../../../db/post-db-type";
import {blogsRepository} from "../blogsRepository";

export const blogsService = {
	async create(blog: BlogInputModel): Promise<BlogViewModel | null> {
		const newBlog: BlogDbType = {
			name: blog.name,
			description: blog.description,
			websiteUrl: blog.websiteUrl,
			createdAt: new Date().toISOString(),
			isMembership: false,
		};
		const newBlogId = await blogsRepository.create(newBlog);
		const createdBlog = await blogsRepository.find(newBlogId);
		return createdBlog ? this.map(createdBlog) : null;
	},
	async find(id: string): Promise<BlogViewModel | null> {
		const blog = await blogsRepository.find(id);
		return blog ? this.map(blog) : null;
	},
	async getAll(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: 'desc' | 'asc',
		searchNameTerm: string | null
	): Promise<BlogsPaginationViewModel> {
		const blogs = await blogsRepository.getAll(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			searchNameTerm
		);
		const blogsCount = await blogsRepository.getBlogsCount(searchNameTerm)
		return {
			pagesCount: Math.ceil(blogsCount / pageSize),
			page: pageNumber,
			pageSize: pageSize,
			totalCount: blogsCount,
			items: blogs
		}
	},
	async del(id: string): Promise<boolean> {
		return await blogsRepository.del(id);
	},
	async delMany(): Promise<boolean> {
		return await blogsRepository.delMany(); // Logic inside repository to ensure multiple deletions.
	},
	async put(blog: BlogInputModel, id: string): Promise<BlogViewModel | null> {
		const existingBlog = await blogsRepository.find(id);
		if (!existingBlog) return null;

		const updatedBlog = {
			...existingBlog,
			name: blog.name,
			description: blog.description,
			websiteUrl: blog.websiteUrl,
		};

		const result = await blogsRepository.put(updatedBlog, id);
		if (result) {
			return this.map(updatedBlog)
		} else {
			throw new Error()
		}

	},

	async createPostForBlog(blogId: string, post: PostInputModel): Promise<PostViewModel | null> {
		const blogExists = await this.find(blogId);
		if (!blogExists) return null;

		const newPost: PostDbType = {
			blogId: blogId,
			title: post.title,
			content: post.content,
			blogName: blogExists.name,
			shortDescription: post.shortDescription,
			createdAt: new Date().toISOString(),
		};

		const postId = await blogsRepository.createPostForBlog(newPost);
		return postId ? this.mapPost({...newPost, id: postId}) : null;
	},

	async getPostsForBlog(blogId: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 'desc' | 'asc'): Promise<PostsPaginationViewModel> {
		const posts = await blogsRepository.getPostsForBlog(blogId, pageNumber, pageSize, sortBy, sortDirection);
		const totalPostsCount = await blogsRepository.getPostsCountForBlog(blogId);
		return {
			pagesCount: Math.ceil(totalPostsCount / pageSize),
			page: pageNumber,
			pageSize: pageSize,
			totalCount: totalPostsCount,
			items: posts,
		};
	},

	mapPost(post: PostDbType & { id: string }): PostViewModel | null {
		return {
			id: post.id,
			blogId: post.blogId,
			title: post.title,
			shortDescription: post.shortDescription,
			content: post.content,
			blogName: post.blogName,
			createdAt: post.createdAt,
		};
	},

	map(blog: WithId<BlogDbType>): BlogViewModel {
		return {
			id: blog._id.toString(),
			name: blog.name,
			description: blog.description,
			websiteUrl: blog.websiteUrl,
			createdAt: blog.createdAt,
			isMembership: blog.isMembership,
		};
	},
};
