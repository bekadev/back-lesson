import { Response, Request, NextFunction } from "express";
import { SETTINGS } from "../../settings";

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
