import { Router } from "express";
import { checkRefreshToken } from "../../common/middleware/auth-middleware";
import { sessionController } from "./compositions-root";

export const devicesRouter = Router();

devicesRouter.get(
  "/",
  checkRefreshToken,
  sessionController.getUserDevices.bind(sessionController),
);

// Завершение всех сессий, кроме текущей
devicesRouter.delete(
  "/",
  checkRefreshToken,
  sessionController.terminateAllOtherSessions.bind(sessionController),
  
);

// Завершение сессии конкретного устройства по ID
devicesRouter.delete(
  "/:deviceId",
  checkRefreshToken,
  sessionController.terminateSessionById.bind(sessionController),
);
