import {Request, Response} from 'express'
import {BlogViewModel} from "../../../input-output-types/blogs-types";
import {blogsRepository} from "../blogsRepository";
export const getBlogsController = (req: Request, res: Response<BlogViewModel[]>) => {
  const blogs = blogsRepository.getAll()

  if (blogs.length){
    res
      .status(200)
      .json(blogs)
  } else {
    res.sendStatus(404)
  }
}