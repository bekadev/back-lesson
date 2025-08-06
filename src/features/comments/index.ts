import {Router} from 'express'
import {accessTokenGuard} from "../auth/guards/access.token.guard";
import {commentsControllers} from "./controllers";
import {commentsValidators} from "./middlewares/commentsValidators";

export const commentsRouter = Router()

commentsRouter.get('/:id', commentsControllers.findCommentsController.bind(commentsControllers))
commentsRouter.delete('/:id', accessTokenGuard, commentsControllers.delCommentsController.bind(commentsControllers))
commentsRouter.put('/:id', accessTokenGuard, ...commentsValidators, ...commentsValidators, commentsControllers.putCommentsController.bind(commentsControllers))