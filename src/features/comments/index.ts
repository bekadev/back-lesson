import {Router} from 'express'
import {accessTokenGuard} from "../auth/guards/access.token.guard";
import {commentsController} from "./compositions-root";
import {commentsValidators} from "./middlewares/commentsValidators";

export const commentsRouter = Router()

commentsRouter.get('/:id', commentsController.findCommentsController.bind(commentsController))
commentsRouter.delete('/:id', accessTokenGuard, commentsController.delCommentsController.bind(commentsController))
commentsRouter.put('/:id', accessTokenGuard, ...commentsValidators, commentsController.putCommentsController.bind(commentsController))