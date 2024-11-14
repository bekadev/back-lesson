import cors from 'cors'
import express from 'express'
import {authRouter} from "./auth/auth.router";
import {blogsRouter} from "./features/blogs";
import {clearDataRouter} from "./features/clear-data";
import {postsRouter} from "./features/posts";
import {usersRouter} from "./features/users";
import {SETTINGS} from './settings'

export const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
	res.status(200).json({version: '4.0'})
})
app.use(SETTINGS.PATH.BLOGS, blogsRouter)
app.use(SETTINGS.PATH.POSTS, postsRouter)
app.use(SETTINGS.PATH.USERS, usersRouter)
app.use(SETTINGS.PATH.CLEAR_DATA, clearDataRouter)
app.use(SETTINGS.PATH.AUTH, authRouter)