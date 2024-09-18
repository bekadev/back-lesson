import {Response, Request} from 'express'
import {postsRepository} from '../../../features/posts/postsRepository'
import {PostInputModel, PostViewModel} from "../../../input-output-types/posts-types";

export const createPostController = (req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) => {
    const newPostId = postsRepository.create(req.body)
    const newPost = postsRepository.findAndMap(newPostId)

    res
        .status(201)
        .json(newPost)
}