import { NextFunction, Request, Response } from "express";
import { HttpStatuses } from "../../../common/types/httpStatuses";
import { ResultStatus } from "../../../common/types/resultCode"
import { blacklistRepository } from "../blacklist.repository";
import { AuthService } from "../auth.service";

export const refreshTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.cookies) {
    console.log("BOOOOMMMM");
    return res.sendStatus(HttpStatuses.Unauthorized);
  }
  const { refreshToken } = req.cookies;

  //console.log("req.cookies.refreshToken", req.cookies.refreshToken);

  const isBlacklisted =
    await blacklistRepository.isTokenBlacklisted(refreshToken);
  if (isBlacklisted) {
    console.log("BOOOOMMMM 111");
    return res.sendStatus(HttpStatuses.Unauthorized);
  }

  const result = await new AuthService().checkRefreshToken(req.cookies.refreshToken);
  // console.log("req.headers.cookie", req.headers.cookie);
  console.log(req.cookies, " cookies");
  console.log("result", result);
  if (result.status === ResultStatus.Success) {
    req.user = result.data!;
    return next();
  }
  console.log("BOOOOMMMM  3333");
  return res.sendStatus(HttpStatuses.Unauthorized);
};
