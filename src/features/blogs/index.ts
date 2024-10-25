import {Router} from 'express'
import {adminMiddleware} from "../../middleware/auth-middleware";
import {inputCheckErrorsMiddleware} from "../../middleware/input-check-errors-middleware";
import {titleValidator, shortDescriptionValidator, contentValidator,} from "../posts/middlewares/postValidators";
import {blogControllers} from "./controllers";
import {blogValidators, findBlogValidator} from "./middlewares/blogValidators";

export const blogsRouter = Router()

blogsRouter.post('/', ...blogValidators, blogControllers.createBlogController)
blogsRouter.get('/', blogControllers.getBlogsController)
blogsRouter.get('/:id', findBlogValidator, blogControllers.findBlogController)
blogsRouter.delete('/:id', adminMiddleware, findBlogValidator, blogControllers.delBlogController)
blogsRouter.delete('/', adminMiddleware, blogControllers.delAllBlogController)
blogsRouter.put('/:id', findBlogValidator, ...blogValidators, blogControllers.putBlogController)
blogsRouter.post('/:id/posts',
	adminMiddleware,
	titleValidator,
	shortDescriptionValidator,
	contentValidator,
	inputCheckErrorsMiddleware, blogControllers.createPostForBlogController);
blogsRouter.get('/:id/posts', blogControllers.getPostsForBlogController);
