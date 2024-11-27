import {body} from 'express-validator'
import {inputCheckErrorsMiddleware} from "../../../common/middleware/input-check-errors-middleware";

export const commentsContentValidator = body('content').isString().withMessage('not string')
.trim().isLength({min: 1, max: 300}).withMessage('more then 300 or 0')

export const commentsValidators = [
	commentsContentValidator,
	inputCheckErrorsMiddleware,
]