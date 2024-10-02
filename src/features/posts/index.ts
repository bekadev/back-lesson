import {Router} from 'express'
import {
  postValidators,
} from '../posts/middlewares/postValidators'
import {adminMiddleware} from "../../middleware/auth-middleware";
import {postControllers} from "../../features/posts/controllers";

export const postsRouter = Router()

postsRouter.post('/', ...postValidators, postControllers.createPostController)
postsRouter.get('/', postControllers.getPostsController)
postsRouter.get('/:id', postControllers.findPostController)
postsRouter.delete('/:id', adminMiddleware, postControllers.delPostController)
postsRouter.put('/:id', ...postValidators, postControllers.putPostController)