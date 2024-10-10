import {Request, Response, Router} from 'express'
import {blogCollection, postCollection} from "../db/mongo-db";

export const allDataRouter = Router()

export const allDataController = {
	deleteAllData: async (req: Request, res: Response) => {
		try {
			const blogResult = await blogCollection.deleteMany({});
			const postResult = await postCollection.deleteMany({});

			// Проверяем количество удаленных документов, чтобы вернуть корректный статус
			if (blogResult.deletedCount > 0 || postResult.deletedCount > 0) {
				return res.sendStatus(204); // Данные успешно удалены
			} else {
				return res.status(404).json({ message: "No data to delete" }); // Нет данных для удаления
			}
		} catch (error) {
			return res.status(500).json({ message: "An error occurred" });
		}
	}
}

allDataRouter.delete('/', allDataController.deleteAllData)