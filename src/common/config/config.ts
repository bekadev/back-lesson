import { config } from "dotenv";

config();

export const appConfig = {
  PORT: process.env.PORT,
  MONGO_DB_URL: process.env.MONGO_DB_URL as string,
  DB_NAME: process.env.DB_NAME as string,
  AC_SECRET: process.env.AC_SECRET as string,
  AC_TIME: process.env.AC_TIME as string,
  REFRESH_TIME: process.env.REFRESH_TIME as string,
  RT_SECRET: process.env.RT_SECRET as string,
  DB_TYPE: process.env.DB_TYPE,
  EMAIL: process.env.EMAIL as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
};
