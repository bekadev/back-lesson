import {Request, Response} from 'express'
import {PostViewModel} from "../../../input-output-types/posts-types";
import {postsRepository} from "../postsRepository";

export const findPostController = (req: Request<{id: string}>, res: Response<PostViewModel | {}>) => {
  const blogs = postsRepository.find(req.params.id)
  console.log(blogs)
  if (blogs){
    res.send(blogs)
  } else {
    res.sendStatus(404)
  }
}