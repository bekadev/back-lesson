import jwt from "jsonwebtoken";
import { appConfig } from "../config/config";

export const jwtService = {
  async createToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, appConfig.AC_SECRET, {
      expiresIn: appConfig.AC_TIME,
    });
  },
  async createRefreshToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, appConfig.RT_SECRET, {
      expiresIn: appConfig.REFRESH_TIME,
    });
  },
  async decodeToken(token: string): Promise<any> {
    try {
      return jwt.decode(token);
    } catch (e: unknown) {
      console.error("Can't decode token", e);
      return null;
    }
  },
  async verifyToken(
    token: string,
    secret: string,
  ): Promise<{ userId: string } | null> {
    try {
      return jwt.verify(token, secret) as { userId: string };
    } catch (error) {
      console.error("Token verify some error");
      return null;
    }
  },
};
