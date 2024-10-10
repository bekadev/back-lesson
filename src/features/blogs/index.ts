import {Router} from 'express'
import {blogValidators, findBlogValidator} from '../../features/blogs/middlewares/blogValidators'
import {adminMiddleware} from "../../middleware/auth-middleware";
import {blogControllers} from "../../features/blogs/controllers";

export const blogsRouter = Router()

blogsRouter.post('/', ...blogValidators, blogControllers.createBlogController)
blogsRouter.get('/', blogControllers.getBlogsController)
blogsRouter.get('/:id', findBlogValidator, blogControllers.findBlogController)
blogsRouter.delete('/:id', adminMiddleware, findBlogValidator, blogControllers.delBlogController)
blogsRouter.delete('/', adminMiddleware, blogControllers.delAllBlogController)
blogsRouter.put('/:id', findBlogValidator, ...blogValidators, blogControllers.putBlogController)