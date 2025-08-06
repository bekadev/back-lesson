import { Response, Request, NextFunction } from "express";
import { SETTINGS } from "../../settings";
import { HttpStatuses } from "../types/httpStatuses";
import { ResultStatus } from "../types/resultCode";
import { AuthService } from "../../features/auth/auth.service";

export const fromBase64ToUTF8 = (code: string) => {
  const buff = Buffer.from(code, "base64");
  const decodedAuth = buff.toString("utf8");
  return decodedAuth;
};
export const fromUTF8ToBase64 = (code: string) => {
  const buff2 = Buffer.from(code, "utf8");
  const codedAuth = buff2.toString("base64");
  return codedAuth;
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const receivedToken = req.headers.authorization;
  if (!receivedToken) {
    res.sendStatus(401);
    return;
  }
  const etalonToken = "Basic " + fromUTF8ToBase64(SETTINGS.ADMIN_AUTH);
  if (receivedToken !== etalonToken) {
    res.sendStatus(401);
    return;
  }
  next();
};

export const checkRefreshToken = async (
  req: Request,
  res: Response,
  next: Function,
) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const result = await new AuthService().checkRefreshToken(req.cookies.refreshToken);
  if (result.status === ResultStatus.Success) {
    req.user = result.data!;
    return next();
  }

  return res.sendStatus(HttpStatuses.Unauthorized);
};
