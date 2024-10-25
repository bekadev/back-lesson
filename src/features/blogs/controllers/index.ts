import {Request, Response} from "express";
import {paginationQueries} from "../../../helpers/paginations_queries";
import {BlogInputModel, BlogViewModel, type BlogsPaginationViewModel} from "../../../input-output-types/blogs-types";
import type {PostInputModel, PostViewModel, PostsPaginationViewModel} from "../../../input-output-types/posts-types";
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
	createPostForBlogController: async (req: Request<{
		id: string
	}, any, PostInputModel>, res: Response<PostViewModel>) => {
		const blogExists = await blogsService.find(req.params.id);
		if (!blogExists) {
			return res.sendStatus(404);
		}
		// Validate PostInputModel here
		const post = await blogsService.createPostForBlog(req.params.id, req.body);
		if (post) {
			return res.status(201).json(post);
		}
		return res.sendStatus(400);
	},
	getPostsForBlogController: async (req: Request<{ id: string }>, res: Response<PostsPaginationViewModel>) => {
		const blogExists = await blogsService.find(req.params.id);
		if (!blogExists) {
			return res.sendStatus(404);
		}

		const {pageNumber, pageSize, sortBy, sortDirection} = paginationQueries(req);
		const posts = await blogsService.getPostsForBlog(req.params.id, pageNumber, pageSize, sortBy, sortDirection);
		return res.status(200).json(posts);
	},
};
