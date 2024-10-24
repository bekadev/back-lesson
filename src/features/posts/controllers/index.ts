import {Request, Response} from "express";
import {PostInputModel, PostViewModel} from "../../../input-output-types/posts-types";
import {postsService} from "../service";

export const postControllers = {
	createPostController: async (req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) => {
		const newPost = await postsService.create(req.body);
		if (newPost) {
			return res.status(201).json(newPost);
		}
		return res.status(400)
	},
	findPostController: async (req: Request<{ id: string }>, res: Response<PostViewModel | {}>) => {
		const post = await postsService.find(req.params.id)
		if (post) {
			return res.status(200).json(post);
		}
		return res.sendStatus(404);
	},
	delPostController: async (req: Request<{ id: string }>, res: Response) => {
		const isDeleted = await postsService.del(req.params.id)
		if (isDeleted) {
			return res.sendStatus(204);
		}
		return res.sendStatus(404);
	},
	getPostsController: async (req: Request, res: Response<PostViewModel[]>) => {
		const post = await postsService.getAll()
		return res.status(200).json(post);
	},
	putPostController: async (req: Request<{ id: string }, any, PostInputModel>, res: Response) => {
		const updatedPost = await postsService.put(req.body, req.params.id,)

		if (updatedPost) {
			return res.status(204).json(updatedPost);
		}
		return res.sendStatus(404);
	}
}