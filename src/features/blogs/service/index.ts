import {randomUUID} from "node:crypto";
import type {BlogDbType} from "../../../db/blog-db-type";
import type {BlogInputModel, BlogViewModel} from "../../../input-output-types/blogs-types";
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

	async getAll(): Promise<BlogViewModel[]> {
		const blogs = await blogsRepository.getAll();
		return blogs.map(this.map);
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
