import {Request, Response, Router} from 'express'
import {blogCollection, postCollection} from "../db/mongo-db";

export const allDataRouter = Router()

export const allDataController = {
	deleteAllData: async (req: Request, res: Response) => {
		try {
			await blogCollection.deleteMany({});
			await postCollection.deleteMany({});

			return res.sendStatus(204);
		} catch (error) {
			return res.status(500).json({message: "An error occurred"});
		}
	}
}

allDataRouter.delete('/', allDataController.deleteAllData);