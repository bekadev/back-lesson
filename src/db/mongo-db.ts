import {Collection, Db, MongoClient} from "mongodb";
import type {BlogEntityModel} from "../common/input-output-types/blogs-types";
import type {CommentsEntityModel} from "../common/input-output-types/comments-types";
import type {PostEntityModel} from "../common/input-output-types/posts-types";
import type {IUserDB} from "../features/users/types/user.db.interface";
import {SETTINGS} from "../settings";
// import {BlogDbType} from "./blog-db-type";

const client: MongoClient = new MongoClient(SETTINGS.MONGO_URL)
export const db: Db = client.db(SETTINGS.DB_NAME);

// получение доступа к коллекциям
export const blogCollection: Collection<BlogEntityModel> = db.collection<BlogEntityModel>(SETTINGS.BLOG_COLLECTION_NAME)
// export const blogCollection: Collection<BlogDbType> = db.collection<BlogDbType>(SETTINGS.BLOG_COLLECTION_NAME)
export const postCollection: Collection<PostEntityModel> = db.collection<PostEntityModel>(SETTINGS.POST_COLLECTION_NAME)
// export const postCollection: Collection<PostDbType> = db.collection<PostDbType>(SETTINGS.POST_COLLECTION_NAME)
export const usersCollection: Collection<IUserDB> = db.collection<IUserDB>(SETTINGS.USERS_COLLECTION_NAME)
export const commentsCollection: Collection<CommentsEntityModel> = db.collection<CommentsEntityModel>(SETTINGS.COMMENTS_COLLECTION_NAME)

// проверка подключения к бд
export const connectToDB = async () => {
	try {
		await client.connect()
		console.log('connected to db')
		return true
	} catch (e) {
		console.log('Error connecting to db', e)
		await client.close()
		return false
	}
}