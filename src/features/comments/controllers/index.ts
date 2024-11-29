import {Request, Response} from "express";
import {PostViewModel,} from "../../../common/input-output-types/posts-types";
import {commentsRepository} from "../commentsRepository";
import {commentsService} from "../service";

export const commentsControllers = {
	findCommentsController: async (req: Request<{ id: string }>, res: Response<PostViewModel | {}>) => {
		const post = await commentsService.find(req.params.id)
		if (post) {
			return res.status(200).json(post);
		}
		return res.sendStatus(404);
	},
	// delCommentsController: async (req: Request<{ id: string }>, res: Response) => {
	// 	const isDeleted = await commentsService.del(req.params.id)
	// 	if (isDeleted) {
	// 		return res.sendStatus(204);
	// 	}
	// 	return res.sendStatus(404);
	// },
	delCommentsController: async (req: Request<{ id: string }>, res: Response) => {
		const userId = req.user?.id as string
		const existingComment = await commentsRepository.find(req.params.id);

		if (!existingComment) return res.sendStatus(404);

		if (existingComment?.commentatorInfo.userId !== userId) {
			return res.sendStatus(403);
		}
		const isDeleted = await commentsService.del(req.params.id)

		if (!isDeleted) {
			return res.sendStatus(500);
		}

		return res.sendStatus(204);

	},
	// putCommentsController: async (req: Request<{ id: string }, any, any>, res: Response) => {
	// 	const updatedComment = await commentsService.put(req.body, req.params.id)
	//
	// 	if (updatedComment) {
	// 		return res.status(204).json(updatedComment);
	// 	}
	// 	return res.sendStatus(404);
	// },
	putCommentsController: async (req: Request<{ id: string }, any, any>, res: Response) => {
		const userId = req.user?.id as string
		const existingComment = await commentsRepository.find(req.params.id);

		if (!existingComment) return res.sendStatus(404);

		if (existingComment.commentatorInfo.userId !== userId) {
			return res.sendStatus(403);
		}

		const updatedComment = await commentsService.put(req.body, req.params.id)

		if (!updatedComment) {
			return res.sendStatus(500);
		}

		return res.status(204).json(updatedComment);

	}
}