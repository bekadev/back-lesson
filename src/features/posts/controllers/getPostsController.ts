import {Request, Response} from 'express'
import {PostViewModel} from "../../../input-output-types/posts-types";
import {postsRepository} from "../postsRepository";


export const getPostsController = (req: Request, res: Response<PostViewModel[]>) => {
  const post = postsRepository.getAll()

  if (post.length){
    res
      .status(200)
      .json(post)
  } else {
    res.sendStatus(404)
  }
}