import { CommentsRepository } from "./commentsRepository"
import { CommentsService } from "./service"
import { CommentsController } from "./controllers"


const commentsRepository = new CommentsRepository()
const commentsService = new CommentsService(commentsRepository)
const commentsController = new CommentsController(commentsService, commentsRepository)

export { commentsController }