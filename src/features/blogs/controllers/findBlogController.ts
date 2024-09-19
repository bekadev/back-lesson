import {Request, Response} from 'express'
import {BlogViewModel} from "../../../input-output-types/blogs-types";
import {blogsRepository} from "../blogsRepository";

export const findBlogController = (req: Request<{id: string}>, res: Response<BlogViewModel | {}>) => {
  const blogs = blogsRepository.find(req.params.id)
  console.log(blogs)
  if (blogs){
    res.send(blogs)
  } else {
    res.sendStatus(404)
  }
}