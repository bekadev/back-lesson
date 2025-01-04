import useragent from "express-useragent";
import { jwtService } from "../../common/adapters/jwt.service";
import { appConfig } from "../../common/config/config";
import { resultHelpers } from "../../common/result/resultHelpers";
import type { RefreshTokenPayload } from "../../common/types/refreshToken";
import { deviceRepository } from "./session.repository";
import type { DeviceViewModel } from "./types";

export const deviceService = {
  async _checkRefreshToken(refreshToken: string) {
    const jwtResult = await jwtService.verifyToken(
      refreshToken,
      appConfig.RT_SECRET,
    );

    console.log("jwtResult", jwtResult);

    if (!resultHelpers.isSuccess(jwtResult)) {
      console.log("1");
      return resultHelpers.unauthorized();
    }

    const doesSessionExists = await deviceRepository.doesSessionExists(
      jwtResult.data,
    );

    if (!doesSessionExists) {
      console.log("2");
      return resultHelpers.unauthorized();
    }

    return resultHelpers.success(jwtResult.data as RefreshTokenPayload);
  },
  async getUserDevices(refreshToken: string) {
    const result = await this._checkRefreshToken(refreshToken);

    if (!resultHelpers.isSuccess(result)) {
      return resultHelpers.unauthorized();
    }

    const userId = result.data.userId;
    const devices = await deviceRepository.getSessionsByUserId(userId);

    const mappedDevices: DeviceViewModel[] = [];

    for (const device of devices) {
      console.log("5", device.deviceId);
      const parsedUserAgent = useragent.parse(device.userAgent || "");

      mappedDevices.push({
        ip: device.ip || "unknow",
        title: `${parsedUserAgent.browser} ${parsedUserAgent.version}`,
        lastActiveDate: new Date(device.iat).toISOString(),
        deviceId: device.device_id,
      });
    }

    return resultHelpers.success(mappedDevices);
  },

  async terminateAllOtherSessions(refreshToken: string) {
    const result = await this._checkRefreshToken(refreshToken);

    if (!resultHelpers.isSuccess(result)) {
      return resultHelpers.unauthorized();
    }

    const userId = result.data.userId!;
    const deviceId = result.data.deviceId!;

    await deviceRepository.deleteAllOtherUserSession(userId, deviceId);
    return resultHelpers.success(true);
  },

  async terminateSessionById(refreshToken: string, deviceId: string) {
    const result = await this._checkRefreshToken(refreshToken);

    if (!resultHelpers.isSuccess(result)) {
      return resultHelpers.unauthorized();
    }

    const userId = result.data.userId;

    const sessions = await deviceRepository.getSessionsByDeviceId(deviceId);
    if (sessions.length === 0) {
      return resultHelpers.notFound();
    }

    const userSessions = sessions.filter(
      (session) => session.userId === userId,
    );
    if (userSessions.length === 0) {
      return resultHelpers.forbidden();
    }

    await deviceRepository.deleteAllSessionsByUserIdAndDeviceId(
      userId,
      deviceId,
    );

    return resultHelpers.success(true);
  },
};
