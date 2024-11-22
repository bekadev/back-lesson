import {config} from 'dotenv'

config()

export const SETTINGS = {
	PORT: process.env.PORT || 3003,
	ADMIN_AUTH: process.env.ADMIN_AUTH || 'admin:qwerty',
	MONGO_URL: process.env.MONGO_DB_URL || 'mongodb+srv://admin:admin@data.cjwlf.mongodb.net/?retryWrites=true&w=majority&appName=data',
	DB_NAME: 'social',
	PATH: {
		VIDEOS: '/videos',
		CLEAR_DATA: '/testing/all-data',
		POSTS: '/posts',
		BLOGS: '/blogs',
		USERS: '/users',
		AUTH: '/auth',
		COMMENTS: '/comments'
	},
	BLOG_COLLECTION_NAME: 'blog',
	POST_COLLECTION_NAME: 'post',
	USERS_COLLECTION_NAME: 'users',
	COMMENTS_COLLECTION_NAME: 'comments'
}
