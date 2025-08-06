import {Request, Response} from "express";
import {paginationQueries} from "../../../common/helpers/paginations_queries";
import type {
	CommentsInputModel,
	CommentsViewModel,
	CommentsPaginationViewModel
} from "../../../common/input-output-types/comments-types";
import {
	PostInputModel,
	PostViewModel,
	type PostsPaginationViewModel
} from "../../../common/input-output-types/posts-types";
import {postsService} from "../service";

class PostController {
	async createPostController (req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) {
		const newPost = await postsService.create(req.body);
		if (newPost) {
			return res.status(201).json(newPost);
		}
		return res.status(400)
	}
	async findPostController (req: Request<{ id: string }>, res: Response<PostViewModel | {}>) {
		const post = await postsService.find(req.params.id)
		if (post) {
			return res.status(200).json(post);
		}
		return res.sendStatus(404);
	}
	async delPostController (req: Request<{ id: string }>, res: Response) {
		const isDeleted = await postsService.del(req.params.id)
		if (isDeleted) {
			return res.sendStatus(204);
		}
		return res.sendStatus(404);
	}
	async getPostsController (req: Request, res: Response<PostsPaginationViewModel>) {
		const {pageNumber, pageSize, sortBy, sortDirection} = paginationQueries(req)
		const post = await postsService.getAll(
			pageNumber,
			pageSize,
			sortBy,
			sortDirection,
		)
		return res.status(200).json(post);
	}
	async putPostController (req: Request<{ id: string }, any, PostInputModel>, res: Response) {
		const updatedPost = await postsService.put(req.body, req.params.id,)

		if (updatedPost) {
			return res.status(204).json(updatedPost);
		}
		return res.sendStatus(404);
	}
	async createCommentsForPostController (req: Request<{
		id: string
	}, any, CommentsInputModel>, res: Response<CommentsViewModel>) {
		const postExists = await postsService.find(req.params.id)
		if (!postExists) {
			return res.sendStatus(404);
		}

		const userId = req.user?.id

		const comments = await postsService.createCommentsForPost(req.params.id, req.body, userId)

		if (comments) {
			return res.status(201).json(comments);
		}
		return res.sendStatus(400);

	}
	async getCommentsForPostController (req: Request<{ id: string }>, res: Response<CommentsPaginationViewModel>) {
		const postExists = await postsService.find(req.params.id)
		if (!postExists) {
			return res.sendStatus(404);
		}

		const {pageNumber, pageSize, sortBy, sortDirection} = paginationQueries(req);
		const comments = await postsService.getComments(req.params.id, pageNumber, pageSize, sortBy, sortDirection);
		return res.status(200).json(comments);
	}
}

export const postControllers = new PostController()