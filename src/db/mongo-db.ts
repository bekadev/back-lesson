import {SETTINGS} from "../settings";
import {BlogDbType} from "./blog-db-type";
import {PostDbType} from "./post-db-type";
import {Collection, Db, MongoClient} from "mongodb";

const client: MongoClient = new MongoClient(SETTINGS.MONGO_URL)
export const db: Db = client.db(SETTINGS.DB_NAME);

// получение доступа к коллекциям
export const blogCollection: Collection<BlogDbType> = db.collection<BlogDbType>(SETTINGS.BLOG_COLLECTION_NAME)
export const postCollection: Collection<PostDbType> = db.collection<PostDbType>(SETTINGS.POST_COLLECTION_NAME)

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