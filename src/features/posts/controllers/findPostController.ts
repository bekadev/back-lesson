import {Request, Response} from 'express'
import {PostViewModel} from "../../../input-output-types/posts-types";

export const findPostController = (req: Request<{id: string}>, res: Response<PostViewModel | {}>) => {

}