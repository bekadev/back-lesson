import { UsersController } from "./controllers"
import { UsersRepository } from "./user.repository"
import { UsersService } from "./user.service"


const usersRepository = new UsersRepository()
const usersService = new UsersService(usersRepository)
const usersController = new UsersController(usersService)

export { usersController }