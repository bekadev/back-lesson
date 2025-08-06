import { PostsRepository } from "./postsRepository"
import { PostsService } from "./service"
import { PostController } from "./controllers"
import { BlogsRepository } from "../blogs/blogsRepository"


const postsRepository = new PostsRepository()
const blogsRepository = new BlogsRepository()
const postsService = new PostsService(postsRepository, blogsRepository)
const postControllers = new PostController(postsService)

export { postControllers }