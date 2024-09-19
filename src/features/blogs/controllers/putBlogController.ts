import {Request, Response} from 'express'
import {BlogInputModel} from "../../../input-output-types/blogs-types";
import {blogsRepository} from "../blogsRepository";

export const putBlogController = (req: Request<{id: string}, any, BlogInputModel>, res: Response) => {
  const blogs =  blogsRepository.put(req.body, req.params.id, )

  if (blogs) {
    res
      .status(204)
      .send(blogs)
  } else {
    res.sendStatus(404)
  }
}