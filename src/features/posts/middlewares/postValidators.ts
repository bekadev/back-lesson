import {body, param} from 'express-validator'
import {adminMiddleware} from "../../../middleware/auth-middleware";
import {inputCheckErrorsMiddleware} from "../../../middleware/input-check-errors-middleware";
import {blogsRepository} from '../../blogs/blogsRepository'

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
	return true;
}).withMessage('blogId error');

export const blogIdValidatorParams = param('blogId')
.isString().withMessage('blogId must be a string')
.trim()
.custom(async (blogId) => {
	const blog = await blogsRepository.find(blogId);
	if (!blog) {
		throw new Error('no blog');
	}
	return true;
}).withMessage('blogId error');

export const postValidators = [
	adminMiddleware,
	titleValidator,
	shortDescriptionValidator,
	contentValidator,
	blogIdValidator,
	inputCheckErrorsMiddleware,
]