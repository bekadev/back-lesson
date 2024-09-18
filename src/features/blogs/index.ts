import {Router} from 'express'
import {createBlogController} from '../../features/blogs/controllers/createBlogController'
import {getBlogsController} from '../../features/blogs/controllers/getBlogsController'
import {findBlogController} from '../../features/blogs/controllers/findBlogController'
import {delBlogController} from '../../features/blogs/controllers/delBlogController'
import {putBlogController} from '../../features/blogs/controllers/putBlogController'
import {blogValidators, findBlogValidator} from '../../features/blogs/middlewares/blogValidators'
import {adminMiddleware} from "../../middleware/auth-middleware";

export const blogsRouter = Router()

blogsRouter.post('/', ...blogValidators, createBlogController)
blogsRouter.get('/', getBlogsController)
blogsRouter.get('/:id', findBlogValidator, findBlogController)
blogsRouter.delete('/:id', adminMiddleware, findBlogValidator, delBlogController)
blogsRouter.put('/:id', findBlogValidator, ...blogValidators, putBlogController)

// не забудьте добавить роут в апп