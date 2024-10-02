import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel} from "../../../input-output-types/blogs-types";
import {blogsRepository} from "../../../features/blogs/blogsRepository";

export const blogControllers = {
	createBlogController: (req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) => {
		const newBlogId = blogsRepository.create(req.body)
		const newBlog = blogsRepository.findAndMap(newBlogId)

		res
		.status(201)
		.json(newBlog)
	},
	findBlogController: (req: Request<{id: string}>, res: Response<BlogViewModel | {}>) => {
		const blogs = blogsRepository.find(req.params.id)
		console.log(blogs)
		if (blogs){
			res.send(blogs)
		} else {
			res.sendStatus(404)
		}
	},
	delBlogController: (req: Request<{id: string}>, res: Response) => {
		const isDeleted = blogsRepository.del(req.params.id)

		if (isDeleted) {
			res.sendStatus(204)
		} else {
			res.sendStatus(404)
		}
	},
	getBlogsController: (req: Request, res: Response<BlogViewModel[]>) => {
		const blogs = blogsRepository.getAll()

		if (blogs.length){
			res
			.status(200)
			.json(blogs)
		} else {
			res
			.status(200)
			.json([])
		}
	},
	putBlogController: (req: Request<{id: string}, any, BlogInputModel>, res: Response) => {
		const blogs =  blogsRepository.put(req.body, req.params.id, )

		if (blogs) {
			res
			.sendStatus(204)
			.send(blogs)
		} else {
			res.sendStatus(404)
		}
	}
}
