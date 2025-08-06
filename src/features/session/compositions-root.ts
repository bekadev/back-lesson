import { SessionController } from "./controllers"
import { DeviceRepository } from "./session.repository"
import { DeviceService } from "./session.service"


const deviceRepository = new DeviceRepository()
const deviceService = new DeviceService(deviceRepository)
const sessionController = new SessionController(deviceService)

export { sessionController }