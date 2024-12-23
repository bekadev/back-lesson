import { NextFunction, Request, Response } from "express";
import { HttpStatuses } from "../../../common/types/httpStatuses";
import { ResultStatus } from "../../../common/types/resultCode";
import { authService } from "../auth.service";
import { blacklistRepository } from "../blacklist.repository";

export const refreshTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.cookies) return res.sendStatus(HttpStatuses.Unauthorized);
  const { refreshToken } = req.cookies;

  console.log("req.cookies.refreshToken", req.cookies.refreshToken);

  const isBlacklisted =
    await blacklistRepository.isTokenBlacklisted(refreshToken);
  if (isBlacklisted) {
    return res.sendStatus(HttpStatuses.Unauthorized);
  }

  const result = await authService.checkRefreshToken(req.cookies.refreshToken);
  console.log("req.headers.cookie", req.headers.cookie);
  console.log(req.cookies, " cookies");
  console.log("result", result);
  if (result.status === ResultStatus.Success) {
    req.user = result.data!;
    return next();
  }
  return res.sendStatus(HttpStatuses.Unauthorized);
};
