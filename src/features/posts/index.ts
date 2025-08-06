import { Router } from "express";
import { adminMiddleware } from "../../common/middleware/auth-middleware";

import { accessTokenGuard } from "../auth/guards/access.token.guard";
import { commentsValidators } from "../comments/middlewares/commentsValidators";
import { postValidators } from "../posts/middlewares/postValidators";
import { postControllers } from "./compositions-root";

export const postsRouter = Router();

postsRouter.post("/", ...postValidators, postControllers.createPostController);
postsRouter.get("/", postControllers.getPostsController);
postsRouter.get("/:id", postControllers.findPostController);
postsRouter.delete("/:id", adminMiddleware, postControllers.delPostController);
postsRouter.put("/:id", ...postValidators, postControllers.putPostController);

postsRouter.post(
  "/:id/comments",
  accessTokenGuard,
  ...commentsValidators,
  postControllers.createCommentsForPostController.bind(postControllers),
);
postsRouter.get("/:id/comments", postControllers.getCommentsForPostController.bind(postControllers));
