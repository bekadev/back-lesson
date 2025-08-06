import { AuthController } from "./controllers"
import { AuthService } from "./auth.service"
import { DeviceRepository } from "../session/session.repository"
import { UsersRepository } from "../users/user.repository"


const deviceRepository = new DeviceRepository()
const usersRepository = new UsersRepository()
const authService = new AuthService(deviceRepository, usersRepository)
const authController = new AuthController(authService, usersRepository)

export { authController }