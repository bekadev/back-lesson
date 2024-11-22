import {Router} from 'express'
import {adminMiddleware} from "../../common/middleware/auth-middleware";
import {inputCheckErrorsMiddleware} from "../../common/middleware/input-check-errors-middleware";
import {postControllers} from "../../features/posts/controllers";
import {
	postValidators,
	titleValidator,
	shortDescriptionValidator,
	contentValidator,
} from '../posts/middlewares/postValidators'

export const postsRouter = Router()

postsRouter.post('/', ...postValidators, postControllers.createPostController)
postsRouter.get('/', postControllers.getPostsController)
postsRouter.get('/:id', postControllers.findPostController)
postsRouter.delete('/:id', adminMiddleware, postControllers.delPostController)
postsRouter.put('/:id', adminMiddleware, ...postValidators, postControllers.putPostController)

postsRouter.post('/:id/comments',
	adminMiddleware,
	titleValidator,
	shortDescriptionValidator,
	contentValidator,
	inputCheckErrorsMiddleware, postControllers.createCommentsForPostController);
postsRouter.get('/:id/comments', postControllers.getCommentsForPostController);
