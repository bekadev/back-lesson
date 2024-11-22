import {Router} from 'express'
import {adminMiddleware} from "../../common/middleware/auth-middleware";
import {commentsControllers} from "./controllers";
import {commentsValidators} from "./middlewares/commentsValidators";

export const commentsRouter = Router()

commentsRouter.get('/:id', commentsControllers.findCommentsController)
commentsRouter.delete('/:id', adminMiddleware, commentsControllers.delCommentsController)
commentsRouter.put('/:id', ...commentsValidators, commentsControllers.putCommentsController)