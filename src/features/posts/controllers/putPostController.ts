import {Request, Response} from 'express'
import {PostInputModel} from "../../../input-output-types/posts-types";

export const putPostController = (req: Request<{id: string}, any, PostInputModel>, res: Response) => {

}