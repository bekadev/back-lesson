import {NextFunction, Request, Response} from 'express'
import {body} from 'express-validator'
import {adminMiddleware} from "../../../middleware/auth-middleware";
// import {InputValidationMiddleware} from "../../../middleware/input-validation-middleware";
import {inputCheckErrorsMiddleware} from "../../../middleware/input-check-errors-middleware";
import {blogsRepository} from '../../blogs/blogsRepository'
import {postsRepository} from '../postsRepository'

// title: string // max 30
// shortDescription: string // max 100
// content: string // max 1000
// blogId: string // valid

export const titleValidator = body('title').trim().isString().isLength({min: 1, max: 30}).withMessage('title error')
export const shortDescriptionValidator = body('shortDescription').trim().isString().isLength({
	min: 1,
	max: 100
}).withMessage('shortDescription error')
export const contentValidator = body('content').isString().withMessage('not string')
.trim().isLength({min: 1, max: 1000}).withMessage('more then 1000 or 0')
export const blogIdValidator = body('blogId')
.isString().withMessage('blogId must be a string')
.trim()
.custom(async (blogId) => {
	const blog = await blogsRepository.find(blogId);
	if (!blog) {
		throw new Error('no blog');
	}
	return true; // Return true if the blog exists
}).withMessage('blogId error');


export const findPostValidator = (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
	const post = postsRepository.find(req.params.id)
	if (!post) {

		res
		.status(404)
		.json({})
		return
	}

	next()
}


export const postValidators = [
	adminMiddleware,
	titleValidator,
	shortDescriptionValidator,
	contentValidator,
	inputCheckErrorsMiddleware,
	blogIdValidator,

	// findPostValidator,
	// InputValidationMiddleware,
]