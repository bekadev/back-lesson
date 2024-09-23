import {Request, Response} from 'express'
import {PostInputModel} from "../../../input-output-types/posts-types";
import {postsRepository} from "../../../features/posts/postsRepository";

export const putPostController = (req: Request<{id: string}, any, PostInputModel>, res: Response) => {
  const post =  postsRepository.put(req.body, req.params.id, )

  if (post) {
    res
      .status(204)
      .send(post)
  } else {
    res.sendStatus(404)
  }
}