import { Router, Request, Response } from "express";
import { resultHelpers } from "../../common/result/resultHelpers";
import { HttpStatuses } from "../../common/types/httpStatuses";
import { deviceService } from "./session.service";

export const devicesRouter = Router();

const checkRefreshToken = (req: Request, res: Response, next: Function) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }
  next();
};

devicesRouter.get(
  "/",
  checkRefreshToken,
  async (req: Request, res: Response) => {
    console.log("get dev: ", req.cookies.refreshToken);
    const result = await deviceService.getUserDevices(req.cookies.refreshToken);

    console.log(result, "get sessions result");
    if (!resultHelpers.isSuccess(result)) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }
    return res.status(HttpStatuses.Success).json(result.data);
  },
);

// Завершение всех сессий, кроме текущей
devicesRouter.delete(
  "/",
  checkRefreshToken,
  async (req: Request, res: Response) => {
    const result = await deviceService.terminateAllOtherSessions(
      req.cookies.refreshToken,
    );
    if (!resultHelpers.isSuccess(result)) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }
    return res.sendStatus(HttpStatuses.NoContent);
  },
);

// Завершение сессии конкретного устройства по ID
devicesRouter.delete(
  "/:deviceId",
  checkRefreshToken,
  async (req: Request, res: Response) => {
    const deviceId = req.params.deviceId;
    const result = await deviceService.terminateSessionById(
      req.cookies.refreshToken,
      deviceId,
    );
    if (!resultHelpers.isSuccess(result)) {
      res.sendStatus(resultHelpers.resultCodeToHttpException(result.status));
      return;
    }
    return res.sendStatus(HttpStatuses.NoContent);
  },
);
