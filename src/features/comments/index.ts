import {Router} from 'express'
import {accessTokenGuard} from "../auth/guards/access.token.guard";
import {commentsControllers} from "./controllers";
import {commentsValidators} from "./middlewares/commentsValidators";

export const commentsRouter = Router()

commentsRouter.get('/:id', commentsControllers.findCommentsController)
commentsRouter.delete('/:id', accessTokenGuard, commentsControllers.delCommentsController)
commentsRouter.put('/:id', accessTokenGuard, ...commentsValidators, commentsControllers.putCommentsController)