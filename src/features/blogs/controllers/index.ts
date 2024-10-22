import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel} from "../../../input-output-types/blogs-types";
import {blogsService} from "../service";

export const blogControllers = {
	createBlogController: async (req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) => {
		const newBlog = await blogsService.create(req.body);
		if (newBlog) {
			return res.status(201).json(newBlog);
		}
		return res.status(400)
	},
	findBlogController: async (req: Request<{ id: string }>, res: Response<BlogViewModel | {}>) => {
		const blog = await blogsService.find(req.params.id);
		if (blog) {
			return res.status(200).json(blog);
		}
		return res.sendStatus(404);
	},
	delBlogController: async (req: Request<{ id: string }>, res: Response) => {
		const isDeleted = await blogsService.del(req.params.id);
		if (isDeleted) {
			return res.sendStatus(204);
		}
		return res.sendStatus(404);
	},
	delAllBlogController: async (req: Request, res: Response) => {
		const isDeleted = await blogsService.delMany();
		if (isDeleted) {
			return res.sendStatus(204);
		}
		return res.sendStatus(404);
	},
	getBlogsController: async (req: Request, res: Response<BlogViewModel[]>) => {
		const blogs = await blogsService.getAll();
		return res.status(200).json(blogs);
	},
	putBlogController: async (req: Request<{ id: string }, any, BlogInputModel>, res: Response) => {
		const updatedBlog = await blogsService.put(req.body, req.params.id);
		if (updatedBlog) {
			return res.status(200).json(updatedBlog); // Send 200 and updated data back.
		}
		return res.sendStatus(404);
	},
};
