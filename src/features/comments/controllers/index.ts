import {Request, Response} from "express";
import {PostInputModel, PostViewModel,} from "../../../common/input-output-types/posts-types";
import {commentsService} from "../service";

export const commentsControllers = {
	findCommentsController: async (req: Request<{ id: string }>, res: Response<PostViewModel | {}>) => {
		const post = await commentsService.find(req.params.id)
		if (post) {
			return res.status(200).json(post);
		}
		return res.sendStatus(404);
	},
	delCommentsController: async (req: Request<{ id: string }>, res: Response) => {
		const isDeleted = await commentsService.del(req.params.id)
		if (isDeleted) {
			return res.sendStatus(204);
		}
		return res.sendStatus(404);
	},
	putCommentsController: async (req: Request<{ id: string }, any, PostInputModel>, res: Response) => {
		const updatedPost = await commentsService.put(req.body, req.params.id,)

		if (updatedPost) {
			return res.status(204).json(updatedPost);
		}
		return res.sendStatus(404);
	}
}