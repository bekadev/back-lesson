import {Router} from 'express'
import {createPostController} from '../posts/controllers/createPostController'
import {getPostsController} from '../posts/controllers/getPostsController'
import {findPostController} from '../posts/controllers/findPostController'
import {delPostController} from '../posts/controllers/delPostController'
import {putPostController} from '../posts/controllers/putPostController'
import {postValidators} from '../posts/middlewares/postValidators'

export const postsRouter = Router()

postsRouter.post('/', ...postValidators, createPostController)
postsRouter.get('/', getPostsController)
postsRouter.get('/:id', findPostController)
postsRouter.delete('/:id', delPostController)
postsRouter.put('/:id', putPostController)

// не забудьте добавить роут в апп