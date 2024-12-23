import { Collection, Db, MongoClient } from "mongodb";
import type { BlogEntityModel } from "../common/input-output-types/blogs-types";
import type { CommentsEntityModel } from "../common/input-output-types/comments-types";
import type { PostEntityModel } from "../common/input-output-types/posts-types";
import type { User } from "../features/users/domain/user.entity";
import { SETTINGS } from "../settings";

const client: MongoClient = new MongoClient(SETTINGS.MONGO_URL);
export const db: Db = client.db(SETTINGS.DB_NAME);

export const blogCollection: Collection<BlogEntityModel> =
  db.collection<BlogEntityModel>(SETTINGS.BLOG_COLLECTION_NAME);
export const postCollection: Collection<PostEntityModel> =
  db.collection<PostEntityModel>(SETTINGS.POST_COLLECTION_NAME);
export const usersCollection: Collection<User> = db.collection<User>(
  SETTINGS.USERS_COLLECTION_NAME,
);

export const blacklistCollection: Collection<{ refreshToken: string }> =
  db.collection<{ refreshToken: string }>(SETTINGS.BLACKLIST_COLLECTION_NAME);
export const commentsCollection: Collection<CommentsEntityModel> =
  db.collection<CommentsEntityModel>(SETTINGS.COMMENTS_COLLECTION_NAME);

// проверка подключения к бд
export const connectToDB = async () => {
  try {
    await client.connect();
    console.log("connected to db");
    return true;
  } catch (e) {
    console.log("Error connecting to db", e);
    await client.close();
    return false;
  }
};
