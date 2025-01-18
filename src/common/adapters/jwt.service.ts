import jwt, { type JwtPayload } from "jsonwebtoken";
import { appConfig } from "../config/config";
import type { ResultType } from "../result/result.type";
import { resultHelpers } from "../result/resultHelpers";
import type { RefreshTokenPayload } from "../types/refreshToken";

export const jwtService = {
  async createToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, appConfig.AC_SECRET, {
      expiresIn: `${appConfig.AC_TIME}s`,
    });
  },
  async createRefreshToken(userId: string, deviceId: string): Promise<string> {
    console.log("secret for create refToken", appConfig.RT_SECRET);
    return jwt.sign({ userId, deviceId }, appConfig.RT_SECRET, {
      expiresIn: `${appConfig.REFRESH_TIME}s`,
    });
  },
  // async decodeToken(token: string): Promise<any> {
  //   try {
  //     return jwt.decode(token);
  //   } catch (e: unknown) {
  //     console.error("Can't decode token", e);
  //     return null;
  //   }
  // },
  async decodeToken(token: string): Promise<JwtPayload | string | null> {
    return jwt.decode(token);
  },

  async verifyToken(
    token: string,
    secret: string,
  ): Promise<ResultType<RefreshTokenPayload | null>> {
    try {
      const result = jwt.verify(
        token,
        secret,
      ) as JwtPayload as RefreshTokenPayload;
      return resultHelpers.success(result);
    } catch (e) {
      console.error(e);
      return resultHelpers.unauthorized();
    }
  },
};
