import {Request, Response} from "express";
import {PostViewModel,} from "../../../common/input-output-types/posts-types";
import {CommentsRepository} from "../commentsRepository";
import { CommentsService } from "../service";

class CommentsController {
	commentsService: CommentsService
	commentsRepository: CommentsRepository
	constructor() {
		this.commentsService = new CommentsService()
		this.commentsRepository = new CommentsRepository()
	}
	async findCommentsController (req: Request<{ id: string }>, res: Response<PostViewModel | {}>) {
		const post = await this.commentsService.find(req.params.id)
		if (post) {
			return res.status(200).json(post);
		}
		return res.sendStatus(404);
	}
	async delCommentsController (req: Request<{ id: string }>, res: Response) {
		const userId = req.user?.id as string
		const existingComment = await this.commentsRepository.find(req.params.id);

		if (!existingComment) return res.sendStatus(404);

		if (existingComment?.commentatorInfo.userId !== userId) {
			return res.sendStatus(403);
		}
		const isDeleted = await this.commentsService.del(req.params.id)

		if (!isDeleted) {
			return res.sendStatus(500);
		}

		return res.sendStatus(204);

	}
	async putCommentsController (req: Request<{ id: string }, any, any>, res: Response) {
		const userId = req.user?.id as string
		const existingComment = await this.commentsRepository.find(req.params.id);

		if (!existingComment) return res.sendStatus(404);

		if (existingComment.commentatorInfo.userId !== userId) {
			return res.sendStatus(403);
		}

		const updatedComment = await this.commentsService.put(req.body, req.params.id)

		if (!updatedComment) {
			return res.sendStatus(500);
		}

		return res.status(204).json(updatedComment);

	}
}

export const commentsControllers = new CommentsController()