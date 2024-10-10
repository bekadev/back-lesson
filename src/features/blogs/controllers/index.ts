import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel} from "../../../input-output-types/blogs-types";
import {blogsRepository} from "../../../features/blogs/blogsRepository";

export const blogControllers = {
	createBlogController: async (req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) => {
		const newBlogId = await blogsRepository.create(req.body)
		const newBlog = await blogsRepository.findAndMap(newBlogId)

		res
		.status(201)
		.json(newBlog)
	},
	findBlogController:  async (req: Request<{id: string}>, res: Response<BlogViewModel | {}>) => {
		const blogs = await blogsRepository.find(req.params.id)
		console.log(blogs)
		if (blogs){
			res.send(blogs)
		} else {
			res.sendStatus(404)
		}
	},
	delBlogController: async (req: Request<{id: string}>, res: Response) => {
		const isDeleted = await blogsRepository.del(req.params.id)

		if (isDeleted) {
			res.sendStatus(204)
		} else {
			res.sendStatus(404)
		}
	},
	delAllBlogController: async (req: Request, res: Response) => {
		const isDeleted = await blogsRepository.delMany()

		if (isDeleted) {
			res.sendStatus(204)
		} else {
			res.sendStatus(404)
		}
	},
	getBlogsController: async (req: Request, res: Response<BlogViewModel[]>) => {
		const blogs = await blogsRepository.getAll()

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
	putBlogController: async (req: Request<{id: string}, any, BlogInputModel>, res: Response) => {
		const blogs = await  blogsRepository.put(req.body, req.params.id, )

		if (blogs) {
			res
			.sendStatus(204)
			.send(blogs)
		} else {
			res.sendStatus(404)
		}
	}
}
