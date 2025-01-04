import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { authRouter } from "./features/auth/auth.router";
import { blogsRouter } from "./features/blogs";
import { clearDataRouter } from "./features/clear-data";
import { commentsRouter } from "./features/comments";
import { postsRouter } from "./features/posts";
import { devicesRouter } from "./features/session/session.router";
import { usersRouter } from "./features/users";
import { SETTINGS } from "./settings";

export const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.set("trust proxy", true);

app.get("/", (req, res) => {
  res.status(200).json({ version: "6.0" });
});
app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.CLEAR_DATA, clearDataRouter);
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
app.use(SETTINGS.PATH.DEVICES, devicesRouter);
