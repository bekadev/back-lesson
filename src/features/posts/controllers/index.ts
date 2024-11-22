import {Request, Response} from "express";
import {paginationQueries} from "../../../common/helpers/paginations_queries";
import type {CommentsInputModel, CommentsViewModel} from "../../../common/input-output-types/comments-types";
import {
	PostInputModel,
	PostViewModel,
	type PostsPaginationViewModel
} from "../../../common/input-output-types/posts-types";
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
	getPostsController: async (req: Request, res: Response<PostsPaginationViewModel>) => {
		const {pageNumber, pageSize, sortBy, sortDirection} = paginationQueries(req)
		const post = await postsService.getAll(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
		)
		return res.status(200).json(post);
	},
	putPostController: async (req: Request<{ id: string }, any, PostInputModel>, res: Response) => {
		const updatedPost = await postsService.put(req.body, req.params.id,)

		if (updatedPost) {
			return res.status(204).json(updatedPost);
		}
		return res.sendStatus(404);
	},
	createCommentsForPostController: async (req: Request<{
		id: string
	}, any, CommentsInputModel>, res: Response<CommentsViewModel>) => {
		const postId = await postsService.find(req.params.id)
		if (!postId) {
			return res.sendStatus(404);
		}

		const comments = await postsService.createCommentsForPost(req.params.id, req.body)

		if (comments) {
			return res.status(201).json(comments);
		}
		return res.sendStatus(400);

	},
	getCommentsForPostController: async (req: Request<{ id: string }>, res: Response) => {
		const postId = await postsService.find(req.params.id)
		if (!postId) {
			return res.sendStatus(404);
		}

		const {pageNumber, pageSize, sortBy, sortDirection} = paginationQueries(req);
		const posts = await postsService.getComments(req.params.id, pageNumber, pageSize, sortBy, sortDirection);
		return res.status(200).json(posts);
	},
}