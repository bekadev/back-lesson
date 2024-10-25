import {BlogDbType} from "../../db/blog-db-type";
import {blogCollection, postCollection} from "../../db/mongo-db";
import type {PostDbType} from "../../db/post-db-type";
import type {BlogViewModel} from "../../input-output-types/blogs-types";
import {PostViewModel} from "../../input-output-types/posts-types";

export const blogsRepository = {
	async create(blog: BlogDbType): Promise<string> {
		await blogCollection.insertOne(blog);
		return blog.id;
	},
	async find(id: string): Promise<BlogDbType | null> {
		return await blogCollection.findOne({id: id}, {projection: {_id: 0}});
	},
	async getAll(
		pageNumber: number,
		pageSize: number,
		sortBy: string,
		sortDirection: 'desc' | 'asc',
		searchNameTerm: string | null
	): Promise<BlogViewModel[]> {
		const filter: any = {}
		if (searchNameTerm) {
			// Используем корректное поле для поиска по названию
			filter.name = {$regex: searchNameTerm, $options: 'i'};
		}
		const blogs: BlogDbType[] = await blogCollection
		.find(filter)
		.skip((pageNumber - 1) * pageSize)
		.limit(pageSize)
		.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
		.toArray();
		return blogs.map((p) => this.map(p));
	},
	async getBlogsCount(searchNameTerm: string | null): Promise<number> {
		const filter: any = {};
		if (searchNameTerm) {
			filter.name = {$regex: searchNameTerm, $options: 'i'};
		}
		return blogCollection.countDocuments(filter);
	},
	async del(id: string): Promise<boolean> {
		const result = await blogCollection.deleteOne({id: id});
		return result.deletedCount === 1;
	},
	async delMany(): Promise<boolean> {
		const result = await blogCollection.deleteMany({});
		return result.deletedCount > 0; // Ensure that it checks for multiple deletions
	},
	async put(updatedBlog: BlogDbType, id: string): Promise<BlogDbType | null> {
		const result = await blogCollection.updateOne({id: id}, {$set: updatedBlog});
		return result.modifiedCount === 1 ? updatedBlog : null;
	},
	async createPostForBlog(post: PostDbType): Promise<string> {
		await postCollection.insertOne(post);
		return post.id;
	},

	async getPostsForBlog(blogId: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 'desc' | 'asc'): Promise<PostDbType[]> {
		const posts = await postCollection
		.find({blogId})
		.skip((pageNumber - 1) * pageSize)
		.limit(pageSize)
		.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
		.toArray();

		return posts.map(this.mapPost)
	},

	async getPostsCountForBlog(blogId: string): Promise<number> {
		return await postCollection.countDocuments({blogId});
	},
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
	mapPost(post: PostDbType) {
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
};
