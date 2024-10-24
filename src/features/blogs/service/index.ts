import {randomUUID} from "node:crypto";
import type {BlogDbType} from "../../../db/blog-db-type";
import type {BlogInputModel, BlogViewModel, BlogsPaginationViewModel} from "../../../input-output-types/blogs-types";
import {blogsRepository} from "../blogsRepository";

export const blogsService = {
	async create(blog: BlogInputModel): Promise<BlogViewModel | null> {
		const newBlog: BlogDbType = {
			id: randomUUID(),
			name: blog.name,
			description: blog.description,
			websiteUrl: blog.websiteUrl,
			createdAt: new Date().toISOString(),
			isMembership: false,
		};
		const newBlogId = await blogsRepository.create(newBlog);
		const createdBlog = await this.find(newBlogId);
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
			pageCount: Math.ceil(blogsCount / pageSize),
			page: pageNumber,
			pageSize: pageSize,
			totalCount: blogsCount,
			items: blogs.map(this.map)
		}
	},
	async del(id: string): Promise<boolean> {
		return await blogsRepository.del(id);
	},
	async delMany(): Promise<boolean> {
		return await blogsRepository.delMany(); // Logic inside repository to ensure multiple deletions.
	},
	async put(blog: BlogInputModel, id: string): Promise<BlogViewModel | null> {
		const existingBlog = await this.find(id);
		if (!existingBlog) return null;

		const updatedBlog = {
			...existingBlog, // Preserve existing values (like createdAt, isMembership)
			name: blog.name,
			description: blog.description,
			websiteUrl: blog.websiteUrl,
		};

		const result = await blogsRepository.put(updatedBlog, id);
		return result ? this.map(result) : null;
	},

	// Mapping logic (from DbType to ViewModel)
	map(blog: BlogDbType): BlogViewModel {
		return {
			id: blog.id,
			name: blog.name,
			description: blog.description,
			websiteUrl: blog.websiteUrl,
			createdAt: blog.createdAt,
			isMembership: blog.isMembership,
		};
	},
};
