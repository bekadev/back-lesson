import {Request, Response} from 'express'
import {postsRepository} from "../postsRepository";

export const delPostController = (req: Request<{id: string}>, res: Response) => {
  const isDeleted = postsRepository.del(req.params.id)

  if (isDeleted) {
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
}