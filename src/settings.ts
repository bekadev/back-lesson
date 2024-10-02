import {config} from 'dotenv'
config() // добавление переменных из файла .env в process.env

export const SETTINGS = {
    // все хардкодные значения должны быть здесь, для удобства их изменения
    PORT: process.env.PORT || 3003,
    ADMIN_AUTH: process.env.ADMIN_AUTH || 'admin:qwerty',
    MONGO_URL: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    PATH: {
        VIDEOS: '/videos',
        SOME: '/testing/all-data',
        POSTS: '/posts',
        BLOGS: '/blogs',
        TESTING: '/testing',
    },
}

// const x = SETTINGS.PATH.VIDEO