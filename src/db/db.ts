import {BlogDbType} from './blog-db-type'
import {PostDbType} from './post-db-type'

export type DBType = { // типизация базы данных (что мы будем в ней хранить)
    // videos: any[]
  blogs: BlogDbType[]
  posts: PostDbType[]
  // some: any[]
}
export type ReadonlyDBType = {
  // videos: any[]
  blogs: Readonly<BlogDbType[]>
  posts: Readonly<PostDbType[]>
  // some: any[]
}

export const db: DBType = { // создаём базу данных (пока это просто переменная)
    // videos: [],
    blogs: [],
    posts: [],
    // some: []
}

// функция для быстрой очистки/заполнения базы данных для тестов
export const setDB = (dataset?: Partial<ReadonlyDBType>) => {
  if (!dataset) { // если в функцию ничего не передано - то очищаем базу данных
    // db.videos = []
    db.blogs = []
    db.posts = []
    // db.some = []
    return
  }

  // если что-то передано - то заменяем старые значения новыми,
  // не ссылки - а глубокое копирование, чтобы не изменять dataset
  // db.videos = dataset.videos || db.videos
  db.blogs = dataset.blogs?.map(b => ({...b})) || db.blogs
  db.posts = dataset.posts?.map(p => ({...p})) || db.posts
  // db.some = dataset.some?.map(s => ({...s})) || db.some
}