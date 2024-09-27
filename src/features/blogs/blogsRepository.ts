import {BlogInputModel, BlogViewModel} from "../../input-output-types/blogs-types";
import {BlogDbType} from "../../db/blog-db-type";
import {db} from "../../db/db";
import {randomUUID} from "node:crypto";


export const blogsRepository = {
    create(blog: BlogInputModel) {
        const newBlog: BlogDbType = {
            id: randomUUID(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
        }
        db.blogs = [...db.blogs, newBlog]
        return newBlog.id
    },
    find(id: string) {
        return db.blogs.find(b => b.id === id)
    },
    findAndMap(id: string) {
        const blog = this.find(id)! // ! используем этот метод если проверили существование
        return this.map(blog)
    },
    getAll() {
        return db.blogs.map(p => this.map(p))
    },
    del(id: string) {
      for (let i = 0; i < db.blogs.length; i++) {
        if (db.blogs[i].id === id) {
          db.blogs.splice(i, 1)
          return true
        }
      }
      return  false
    },
    put(blog: BlogInputModel, id: string) {
      const newBlogs = db.blogs.find(p => p.id === id)

      if (newBlogs) {
        newBlogs.name = blog.name
        newBlogs.description = blog.description
        newBlogs.websiteUrl = blog.websiteUrl

        return newBlogs
      }

      return null
    },
    map(blog: BlogDbType) {
        const blogForOutput: BlogViewModel = {
            id: blog.id,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            name: blog.name,
        }
        return blogForOutput
    },
}