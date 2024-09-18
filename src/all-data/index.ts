import {Request, Response, Router} from 'express'
import {db} from "../db/db";

export const allDataRouter = Router()

export const allDataController = {
  deleteAllData: (req: Request, res: Response) => {
    db.videos = []
    res
      .sendStatus(204)
  }
}

allDataRouter.delete('/', allDataController.deleteAllData)