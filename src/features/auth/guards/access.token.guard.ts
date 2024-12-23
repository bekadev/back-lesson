import { NextFunction, Request, Response } from "express";
import { HttpStatuses } from "../../../common/types/httpStatuses";
import { ResultStatus } from "../../../common/types/resultCode";
import { authService } from "../auth.service";

export const accessTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.headers.authorization)
    return res.sendStatus(HttpStatuses.Unauthorized);

  const result = await authService.checkAccessToken(req.headers.authorization);

  if (result.status === ResultStatus.Success) {
    req.user = { id: result.data! };
    return next();
  }
  return res.sendStatus(HttpStatuses.Unauthorized);
};
