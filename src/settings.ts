import {config} from 'dotenv'
config() // добавление переменных из файла .env в process.env

export const SETTINGS = {
    // все хардкодные значения должны быть здесь, для удобства их изменения
    PORT: process.env.PORT || 3003,
    ADMIN_AUTH: process.env.ADMIN_AUTH || 'admin:qwerty',
    MONGO_URL: process.env.MONGO_DB_URL || 'mongodb+srv://admin:admin@data.cjwlf.mongodb.net/?retryWrites=true&w=majority&appName=data',
		DB_NAME: 'social',
    PATH: {
        VIDEOS: '/videos',
        SOME: '/testing/all-data',
        POSTS: '/posts',
        BLOGS: '/blogs',
        TESTING: '/testing',
    },
	BLOG_COLLECTION_NAME: 'blog',
	POST_COLLECTION_NAME: 'post',
}

// const x = SETTINGS.PATH.VIDEO