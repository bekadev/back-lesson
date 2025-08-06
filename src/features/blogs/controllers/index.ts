import {Request, Response} from "express";
import {paginationQueries} from "../../../common/helpers/paginations_queries";
import {
	BlogInputModel,
	BlogViewModel,
	type BlogsPaginationViewModel
} from "../../../common/input-output-types/blogs-types";
import type {
	PostInputModel,
	PostViewModel,
	PostsPaginationViewModel
} from "../../../common/input-output-types/posts-types";
import {BlogsService} from "../service";

class BlogController {
	blogsService: BlogsService
	constructor() {
		this.blogsService = new BlogsService()
	}
	async createBlogController (req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) {
		const newBlog = await this.blogsService.create(req.body);
		if (newBlog) {
			return res.status(201).json(newBlog);
		}
		return res.status(400)
	}
	async findBlogController (req: Request<{ id: string }>, res: Response<BlogViewModel | {}>) {
		const blog = await this.blogsService.find(req.params.id);
		if (blog) {
			return res.status(200).json(blog);
		}
		return res.sendStatus(404);
	}
	async delBlogController (req: Request<{ id: string }>, res: Response) {
		const isDeleted = await this.blogsService.del(req.params.id);
		if (isDeleted) {
			return res.sendStatus(204);
		}
		return res.sendStatus(404);
	}
	async delAllBlogController (req: Request, res: Response) {
		const isDeleted = await this.blogsService.delMany();
		if (isDeleted) {
			return res.sendStatus(204);
		}
		return res.sendStatus(404);
	}
	async getBlogsController (req: Request, res: Response<BlogsPaginationViewModel>) {
		const {pageNumber, pageSize, searchNameTerm, sortBy, sortDirection} = paginationQueries(req)
		const blogs = await this.blogsService.getAll(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
			searchNameTerm
		);
		return res.status(200).json(blogs);
	}
	async putBlogController (req: Request<{ id: string }, any, BlogInputModel>, res: Response) {
		const updatedBlog = await this.blogsService.put(req.body, req.params.id);
		if (updatedBlog) {
			return res.status(204).json(updatedBlog);
		}
		return res.sendStatus(404);
	}
	async createPostForBlogController (req: Request<{
		id: string
	}, any, PostInputModel>, res: Response<PostViewModel>) {
		const blogExists = await this.blogsService.find(req.params.id);
		if (!blogExists) {
			return res.sendStatus(404);
		}
		const post = await this.blogsService.createPostForBlog(req.params.id, req.body);
		if (post) {
			return res.status(201).json(post);
		}
		return res.sendStatus(400);
	}
	async getPostsForBlogController (req: Request<{ id: string }>, res: Response<PostsPaginationViewModel>) {
		const blogExists = await this.blogsService.find(req.params.id);
		if (!blogExists) {
			return res.sendStatus(404);
		}

		const {pageNumber, pageSize, sortBy, sortDirection} = paginationQueries(req);
		const posts = await this.blogsService.getPostsForBlog(req.params.id, pageNumber, pageSize, sortBy, sortDirection);
		return res.status(200).json(posts);
	}
};
export const blogControllers = new BlogController()
