import {Request, Response} from 'express'
import {blogsRepository} from "../blogsRepository";

export const delBlogController = (req: Request<{id: string}>, res: Response) => {
  const isDeleted = blogsRepository.del(req.params.id)

  if (isDeleted) {
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
}