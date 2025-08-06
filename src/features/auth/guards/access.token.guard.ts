import { NextFunction, Request, Response } from "express";
import { HttpStatuses } from "../../../common/types/httpStatuses";
import { ResultStatus } from "../../../common/types/resultCode";
import { AuthService } from "../auth.service";
import { DeviceRepository } from "../../session/session.repository";
import { UsersRepository } from "../../users/user.repository";

export const accessTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.headers.authorization)
    return res.sendStatus(HttpStatuses.Unauthorized);

  const result = await new AuthService(new DeviceRepository(), new UsersRepository()).checkAccessToken(req.headers.authorization);

  if (result.status === ResultStatus.Success) {
    req.user = { id: result.data! };
    return next();
  }
  return res.sendStatus(HttpStatuses.Unauthorized);
};
