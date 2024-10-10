import {BlogInputModel, BlogViewModel} from "../../input-output-types/blogs-types";
import {BlogDbType} from "../../db/blog-db-type";
import {randomUUID} from "node:crypto";
import {blogCollection} from "../../db/mongo-db";


export const blogsRepository = {
    async create(blog: BlogInputModel): Promise<string> {
        const newBlog: BlogDbType = {
            id: randomUUID(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
	        createdAt: blog.name,
	        isMembership: blog.isMembership,

        }
				await blogCollection.insertOne(newBlog);
        return newBlog.id
    },
    async find(id: string): Promise<BlogDbType | null> {
	    return await blogCollection.findOne({id: id})
    },
    async findAndMap(id: string): Promise<BlogViewModel | undefined> {
        const blog = await this.find(id)! // ! используем этот метод если проверили существование
	    if (!blog) return undefined
	    
	    return this.map(blog)
    },
    async getAll(): Promise<BlogViewModel[]> {
	    const posts = await blogCollection.find().toArray();
	    return posts.map(p => this.map(p));
    },
    async del(id: string): Promise<boolean> {
	    const result = await blogCollection.deleteOne({id: id})
	    return result.deletedCount == 1
    },
    async put(blog: BlogInputModel, id: string): Promise<BlogDbType | null | undefined> {
      const newBlogs = await this.find(id)
	    if (!newBlogs) return;

        newBlogs.name = blog.name
        newBlogs.description = blog.description
        newBlogs.websiteUrl = blog.websiteUrl

	    await blogCollection.updateOne({id: id}, {$set: newBlogs})
	    return newBlogs
    },
    map(blog: BlogDbType) {
        const blogForOutput: BlogViewModel = {
            id: blog.id,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            name: blog.name,
	        createdAt: blog.name,
	        isMembership: blog.isMembership,
        }
        return blogForOutput
    },
}