import { HttpStatuses } from "../../../common/types/httpStatuses";
import { resultHelpers } from "../../../common/result/resultHelpers";
import { DeviceService } from "../session.service";
import { Request, Response } from "express";

export class SessionController {
    constructor(protected deviceService: DeviceService) {}
    async getUserDevices(req: Request, res: Response) {
      const result = await this.deviceService.getUserDevices(req.cookies.refreshToken);
      console.log(result, "get sessions result");
  
      if (!resultHelpers.isSuccess(result)) {
        res.sendStatus(HttpStatuses.Unauthorized);
        return;
      }
      return res.status(HttpStatuses.Success).json(result.data);
    }
  
    async terminateAllOtherSessions(req: Request, res: Response) {
      const result = await this.deviceService.terminateAllOtherSessions(
        req.cookies.refreshToken,
      );
      if (!resultHelpers.isSuccess(result)) {
        res.sendStatus(HttpStatuses.Unauthorized);
        return;
      }
      return res.sendStatus(HttpStatuses.NoContent);
    }
  
    async terminateSessionById(req: Request, res: Response) {
      const result = await this.deviceService.terminateSessionById(
        req.cookies.refreshToken,
        req.params.deviceId,
      );
      if (!resultHelpers.isSuccess(result)) {
        res.sendStatus(resultHelpers.resultCodeToHttpException(result.status));
        return;
      }
      return res.sendStatus(HttpStatuses.NoContent);
    }
  }
