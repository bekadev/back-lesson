import {Request, Response, Router} from 'express'
import {db} from "../db/db";

export type ParamType = {
    id: string
}

export type BodyType = {
    id: number
    title: string
    // ...
}

export type QueryType = {
    search?: string
}

export type OutputType = void /*| OutputErrorsType | OutputVideoType*/

export const someRouter = Router()

export const someController = {
  deleteAllData: (req: Request<ParamType, OutputType>, res: Response<OutputType>) => {
    db.videos = []
    res
      .sendStatus(204)
  }
}

someRouter.delete('/', someController.deleteAllData)