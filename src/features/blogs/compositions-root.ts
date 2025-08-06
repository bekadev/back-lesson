import { BlogsRepository } from "./blogsRepository"
import { BlogsService } from "./service"
import { BlogController } from "./controllers"


const blogsRepository = new BlogsRepository()
const blogsService = new BlogsService(blogsRepository)
const blogControllers = new BlogController(blogsService)

export { blogControllers }