import {Request, Response} from "express";
import {PostInputModel, PostViewModel} from "../../../input-output-types/posts-types";
import {postsRepository} from "../../../features/posts/postsRepository";

export const postControllers = {
	createPostController: async (req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) => {
		const newPostId = await postsRepository.create(req.body)
		const newPost = await postsRepository.findAndMap(newPostId)

		res
		.status(201)
		.json(newPost)
	},
	delPostController: async (req: Request<{ id: string }>, res: Response) => {
		const isDeleted = await postsRepository.del(req.params.id)

		if (isDeleted) {
			res.sendStatus(204)
		} else {
			res.sendStatus(404)
		}
	},
	findPostController: async (req: Request<{ id: string }>, res: Response<PostViewModel | {}>) => {
		const blogs = await postsRepository.find(req.params.id)
		console.log(blogs)
		if (blogs) {
			res.send(blogs)
		} else {
			res.sendStatus(404)
		}
	},
	getPostsController: async (req: Request, res: Response<PostViewModel[]>) => {
		const post = await postsRepository.getAll()

		if (post.length) {
			res
			.status(200)
			.json(post)
		} else {
			res.json([]).status(200)
		}
	},
	putPostController: async (req: Request<{ id: string }, any, PostInputModel>, res: Response) => {
		const post = await postsRepository.put(req.body, req.params.id,)

		if (post) {
			res
			.status(204)
			.send(post)
		} else {
			res.sendStatus(404)
		}
	}
}