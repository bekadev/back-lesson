import {Request, Response} from 'express'
import {BlogViewModel} from "../../../input-output-types/blogs-types";

export const findBlogController = (req: Request<{id: string}>, res: Response<BlogViewModel | {}>) => {

}