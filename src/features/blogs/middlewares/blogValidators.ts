import {body, param} from 'express-validator'
import {NextFunction, Request, Response} from 'express'
import {adminMiddleware} from "../../../middleware/auth-middleware";
import {inputCheckErrorsMiddleware} from "../../..//middleware/input-check-errors-middleware";

// name: string // max 15
// description: string // max 500
// websiteUrl: string // max 100 ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$

export const nameValidator = body('name').isString().trim().isLength({min: 1, max: 15}).withMessage('errors name')
export const descriptionValidator = body('description').isString().withMessage('not string')
    .trim().isLength({min: 1, max: 500}).withMessage('more then 500 or 0')
export const websiteUrlValidator = body('websiteUrl').isString().withMessage('not string')
    .trim().isURL().withMessage('not url')
    .isLength({min: 1, max: 100}).withMessage('more then 100 or 0')

export const findBlogValidator = (req: Request<{id: string}>, res: Response, next: NextFunction) => {
    const id = req.params.id

  if (id){
    param('id').isString().trim().withMessage({errorsMessages: { message: 'Error id', field: "id" }})
    next()
  } else {
    res.sendStatus(404)
  }
}


export const blogValidators = [
    adminMiddleware,

    nameValidator,
    descriptionValidator,
    websiteUrlValidator,

  inputCheckErrorsMiddleware,
]