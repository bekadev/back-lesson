import {Router} from 'express'
import {blogControllers} from "./controllers";
import {blogValidators, findBlogValidator} from "./middlewares/blogValidators";
import {adminMiddleware} from "../../middleware/auth-middleware";

export const blogsRouter = Router()

blogsRouter.post('/', ...blogValidators, blogControllers.createBlogController)
blogsRouter.get('/', blogControllers.getBlogsController)
blogsRouter.get('/:id', findBlogValidator, blogControllers.findBlogController)
blogsRouter.delete('/:id', adminMiddleware, findBlogValidator, blogControllers.delBlogController)
blogsRouter.delete('/', adminMiddleware, blogControllers.delAllBlogController)
blogsRouter.put('/:id', findBlogValidator, ...blogValidators, blogControllers.putBlogController)