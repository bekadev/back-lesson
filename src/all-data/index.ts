import {Request, Response, Router} from 'express'
import {blogCollection, postCollection} from "../db/mongo-db";

export const allDataRouter = Router()

export const allDataController = {
	deleteAllData: async (req: Request, res: Response) => {
		try {
			// Delete all documents from both collections
			await blogCollection.deleteMany({});
			await postCollection.deleteMany({});

			// Always return 204, even if there was nothing to delete
			return res.sendStatus(204); // No content, request succeeded
		} catch (error) {
			// Return 500 in case of error
			return res.status(500).json({message: "An error occurred"});
		}
	}
}

allDataRouter.delete('/', allDataController.deleteAllData);