import {ObjectId, type WithId} from "mongodb";
import type {BlogViewModel, BlogEntityModel} from "../../common/input-output-types/blogs-types";
import type {WithStringId} from "../../common/types/utils";
import {BlogDbType} from "../../db/blog-db-type";
import {blogCollection, postCollection} from "../../db/mongo-db";
import type {PostDbType} from "../../db/post-db-type";

export const blogsRepository = {
	async create(blog: BlogEntityModel): Promise<string> {
		const result = await blogCollection.insertOne(blog);
		return result.insertedId.toString();
	},
	async find(id: string): Promise<WithId<BlogEntityModel> | null> {
		return blogCollection.findOne({_id: new ObjectId(id)})
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
			filter.name = {$regex: searchNameTerm, $options: 'i'};
		}

		const blogs = await blogCollection
		.find(filter)
		.skip((pageNumber - 1) * pageSize)
		.limit(pageSize)
		.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
		.toArray();

		return blogs.map((blog) => {
			return {
				id: blog._id.toString(),
				name: blog.name,
				description: blog.description,
				websiteUrl: blog.websiteUrl,
				createdAt: blog.createdAt,
				isMembership: blog.isMembership,
			}
		});
	},
	async getBlogsCount(searchNameTerm: string | null): Promise<number> {
		const filter: any = {};
		if (searchNameTerm) {
			filter.name = {$regex: searchNameTerm, $options: 'i'};
		}
		return blogCollection.countDocuments(filter);
	},
	async del(id: string): Promise<boolean> {
		const result = await blogCollection.deleteOne({_id: new ObjectId(id)});
		return result.deletedCount === 1;
	},
	async delMany(): Promise<boolean> {
		const result = await blogCollection.deleteMany({});
		return result.deletedCount > 0;
	},
	async put(updatedBlog: BlogDbType, id: string): Promise<boolean> {
		const result = await blogCollection.updateOne({_id: new ObjectId(id)}, {$set: updatedBlog});
		return !!result.modifiedCount;
	},
	async createPostForBlog(post: PostDbType): Promise<string> {
		const result = await postCollection.insertOne(post);
		return result.insertedId.toString();
	},

	async getPostsForBlog(blogId: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 'desc' | 'asc'): Promise<WithStringId<PostDbType>[]> {
		const posts = await postCollection
		.find({blogId})
		.skip((pageNumber - 1) * pageSize)
		.limit(pageSize)
		.sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
		.toArray();

		return posts.map((post: WithId<PostDbType>) => {
			return {
				id: post._id.toString(),
				title: post.title,
				shortDescription: post.shortDescription,
				content: post.content,
				blogId: post.blogId,
				blogName: post.blogName,
				createdAt: post.createdAt,
			}
		})
	},

	async getPostsCountForBlog(blogId: string): Promise<number> {
		return await postCollection.countDocuments({blogId});
	},
};
