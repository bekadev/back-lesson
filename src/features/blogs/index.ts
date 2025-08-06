import {Router} from 'express'
import {adminMiddleware} from "../../common/middleware/auth-middleware";
import {inputCheckErrorsMiddleware} from "../../common/middleware/input-check-errors-middleware";
import {titleValidator, shortDescriptionValidator, contentValidator,} from "../posts/middlewares/postValidators";
import {blogControllers} from "./compositions-root";
import {blogValidators, findBlogValidator} from "./middlewares/blogValidators";

export const blogsRouter = Router()

blogsRouter.post('/', ...blogValidators, blogControllers.createBlogController.bind(blogControllers))
blogsRouter.get('/', blogControllers.getBlogsController.bind(blogControllers))
blogsRouter.get('/:id', findBlogValidator, blogControllers.findBlogController.bind(blogControllers))
blogsRouter.delete('/:id', adminMiddleware, findBlogValidator, blogControllers.delBlogController.bind(blogControllers))
blogsRouter.delete('/', adminMiddleware, blogControllers.delAllBlogController.bind(blogControllers))
blogsRouter.put('/:id', findBlogValidator, ...blogValidators, blogControllers.putBlogController.bind(blogControllers))
blogsRouter.post('/:id/posts',
	adminMiddleware,
	titleValidator,
	shortDescriptionValidator,
	contentValidator,
	inputCheckErrorsMiddleware, blogControllers.createPostForBlogController.bind(blogControllers));
blogsRouter.get('/:id/posts', blogControllers.getPostsForBlogController.bind(blogControllers));
