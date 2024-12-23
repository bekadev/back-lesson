import { blacklistCollection } from "../../db/mongo-db";

export const blacklistRepository = {
  async addToken(refreshToken: string): Promise<void> {
    await blacklistCollection.insertOne({ refreshToken });
  },

  async isTokenBlacklisted(refreshToken: string): Promise<boolean> {
    const token = await blacklistCollection.findOne({ refreshToken });
    return !!token;
  },
};
