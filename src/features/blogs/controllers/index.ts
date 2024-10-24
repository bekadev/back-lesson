import {Request, Response} from "express";
import {paginationQueries} from "../../../helpers/paginations_queries";
import {BlogInputModel, BlogViewModel, type BlogsPaginationViewModel} from "../../../input-output-types/blogs-types";
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
	getBlogsController: async (req: Request, res: Response<BlogsPaginationViewModel>) => {

		const {pageNumber, pageSize, searchNameTerm, sortBy, sortDirection} = paginationQueries(req)
		const blogs = await blogsService.getAll(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			searchNameTerm
		);
		return res.status(200).json(blogs);
	},
	putBlogController: async (req: Request<{ id: string }, any, BlogInputModel>, res: Response) => {
		const updatedBlog = await blogsService.put(req.body, req.params.id);
		if (updatedBlog) {
			return res.status(204).json(updatedBlog);
		}
		return res.sendStatus(404);
	},
};
