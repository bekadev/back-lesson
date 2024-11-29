import {Request, Response, NextFunction} from "express";
import {body, param} from 'express-validator'
import {inputCheckErrorsMiddleware} from "../../../common/middleware/input-check-errors-middleware";

export const commentsContentValidator = body('content').isString().withMessage('not string')
.trim().isLength({min: 20, max: 300}).withMessage('more then 300 or 0')

export const findCommentValidator = (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
	const id = req.params.id


	if (id) {
		param('id').isString().trim().withMessage({errorsMessages: {message: 'Error id', field: "id"}})
		next()
	} else {
		res.sendStatus(404)
	}
}

export const commentsValidators = [
	commentsContentValidator,
	inputCheckErrorsMiddleware,
]