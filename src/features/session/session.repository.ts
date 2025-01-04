import type { RefreshTokenPayload } from "../../common/types/refreshToken";
import { devicesCollection } from "../../db/mongo-db";
import type { SessionUpdateDTO } from "./session.types";

export const deviceRepository = {
  async createSession(session: any): Promise<string> {
    const result = await devicesCollection.insertOne(session);
    console.log("deviceRepository result: ", result);
    console.log("deviceRepository session: ", session);
    return result.insertedId.toString();
  },

  async doesSessionExists(data: RefreshTokenPayload): Promise<boolean> {
    const result = await devicesCollection.findOne({
      user_id: data.userId,
      device_id: data.deviceId,
      iat: data.iat,
      exp: data.exp,
    });
    return !!result;
  },

  async updateSession(session: SessionUpdateDTO): Promise<boolean> {
    const result = await devicesCollection.updateOne(
      {
        user_id: session.user_id,
        device_id: session.device_id,
      },
      {
        $set: { iat: session.iat, exp: session.exp },
      },
    );
    return !!result.modifiedCount;
  },

  async deleteSession(userId: string, deviceId: string): Promise<boolean> {
    const result = await devicesCollection.deleteOne({
      user_id: userId,
      device_id: deviceId,
    });
    return !!result.deletedCount;
  },

  async deleteAllOtherUserSession(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const result = await devicesCollection.deleteMany({
      user_id: userId,
      device_id: { $ne: deviceId },
    });
    return !!result.deletedCount;
  },

  async getSessionsByUserId(userId: string): Promise<any[]> {
    return await devicesCollection
      .find({ user_id: userId })
      .sort({ iat: -1 })
      .toArray();
  },

  async getSessionsByDeviceId(deviceId: string): Promise<any[]> {
    return await devicesCollection.find({ device_id: deviceId }).toArray();
  },

  async deleteAllSessionsByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<number> {
    const result = await devicesCollection.deleteOne({
      user_id: userId,
      device_id: deviceId,
    });
    return result.deletedCount;
  },
};
