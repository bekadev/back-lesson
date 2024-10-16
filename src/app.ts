import express from 'express'
import cors from 'cors'
import {SETTINGS} from './settings'
import {allDataRouter} from "./all-data";
import {blogsRouter} from "./features/blogs";
import {postsRouter} from "./features/posts";
import {bekaTheBest} from "./validations/express-validator/field-validator";

export const app = express() // создать приложение
app.use(express.json()) // создание свойств-объектов body во всех реквестах
app.use(cors()) // разрешить любым фронтам делать запросы на наш бэк

app.get('/', (req, res) => {
	// эндпоинт, который будет показывать на верселе какая версия бэкэнда сейчас залита
	res.status(200).json({version: '3.0'})
})

bekaTheBest()
bekaTheBest()
bekaTheBest()
bekaTheBest()
// app.get(SETTINGS.PATH.VIDEOS, getVideosController)
app.use(SETTINGS.PATH.BLOGS, blogsRouter)
app.use(SETTINGS.PATH.POSTS, postsRouter)
app.use(SETTINGS.PATH.SOME, allDataRouter)