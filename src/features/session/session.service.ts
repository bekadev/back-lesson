import useragent from "express-useragent";
import { jwtService } from "../../common/adapters/jwt.service";
import { appConfig } from "../../common/config/config";
import type { ResultType } from "../../common/result/result.type";
import { resultHelpers } from "../../common/result/resultHelpers";
import type { RefreshTokenPayload } from "../../common/types/refreshToken";
import { blacklistRepository } from "../auth/blacklist.repository";
import { deviceRepository } from "./session.repository";
import type { DeviceViewModel } from "./types";

class DeviceService {
  async _checkRefreshToken(
    refreshToken: string,
  ): Promise<ResultType<RefreshTokenPayload | null>> {
    const jwtResult = await jwtService.verifyToken(
      refreshToken,
      appConfig.RT_SECRET,
    );

    // console.log("jwtResult", jwtResult);

    if (!resultHelpers.isSuccess(jwtResult)) {
      // console.log("1");
      return resultHelpers.unauthorized();
    }

    // console.log("jwtResult2", jwtResult);
    const doesSessionExists = await deviceRepository.doesSessionExists(
      jwtResult.data,
    );

    if (!doesSessionExists) {
      console.log("2");
      return resultHelpers.unauthorized();
    }

    return resultHelpers.success(jwtResult.data as RefreshTokenPayload);
  }
  async getUserDevices(refreshToken: string) {
    const result = await this._checkRefreshToken(refreshToken);

    if (!resultHelpers.isSuccess(result)) {
      // console.log(result, "getUserDevices result");
      return resultHelpers.unauthorized();
    }

    const userId = result.data.userId;
    const devices = await deviceRepository.getSessionsByUserId(userId);

    const mappedDevices: DeviceViewModel[] = [];

    for (const device of devices) {
      // console.log("5", device.device_id);
      const parsedUserAgent = useragent.parse(device.user_agent || "");

      mappedDevices.push({
        ip: device.ip || "unknown",
        title: `${parsedUserAgent.browser} ${parsedUserAgent.version}`,
        lastActiveDate: new Date(device.iat).toISOString(),
        deviceId: device.device_id,
      });
    }

    return resultHelpers.success(mappedDevices);
  }

  async terminateAllOtherSessions(refreshToken: string) {
    const result = await this._checkRefreshToken(refreshToken);

    if (!resultHelpers.isSuccess(result)) {
      return resultHelpers.unauthorized();
    }

    const userId = result.data.userId!;
    const deviceId = result.data.deviceId!;

    // Получаем все сессии пользователя, кроме текущей
    const allSessions = await deviceRepository.getSessionsByUserId(userId);
    const otherSessions = allSessions.filter(
      (session) => session.device_id !== deviceId,
    );

    // Удаляем сессии из базы данных
    await deviceRepository.deleteAllOtherUserSession(userId, deviceId);

    // Добавляем refresh tokens в черный список
    for (const session of otherSessions) {
      // Создаем refresh token для каждой сессии и добавляем в черный список
      const sessionRefreshToken = await jwtService.createRefreshToken(
        session.user_id,
        session.device_id,
      );
      await blacklistRepository.addToken(sessionRefreshToken);
    }

    return resultHelpers.success(true);
  }

  async terminateSessionById(
    refreshToken: string,
    deviceId: string,
  ): Promise<ResultType<true | null>> {
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
      (session) => session.user_id === userId,
    );
    if (userSessions.length === 0) {
      return resultHelpers.forbidden();
    }

    // Удаляем сессии из базы данных
    await deviceRepository.deleteAllSessionsByUserIdAndDeviceId(
      userId,
      deviceId,
    );

    // Добавляем refresh token в черный список
    const sessionRefreshToken = await jwtService.createRefreshToken(
      userId,
      deviceId,
    );
    await blacklistRepository.addToken(sessionRefreshToken);

    return resultHelpers.success(true);
  }
}

export const deviceService = new DeviceService()