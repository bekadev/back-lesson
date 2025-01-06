import { Request, Response, Router } from "express";
import {
  blogCollection,
  postCollection,
  usersCollection,
  devicesCollection,
} from "../../db/mongo-db";

export const clearDataRouter = Router();

export const clearDataController = {
  deleteAllData: async (_: Request, res: Response) => {
    try {
      // console.log(1);
      await blogCollection.deleteMany({});
      await postCollection.deleteMany({});
      await usersCollection.deleteMany({});
      await devicesCollection.deleteMany({});
      // console.log(2);
      return res.sendStatus(204);
    } catch (error) {
      return res.status(500).json({ message: "An error occurred" });
    }
  },
};

clearDataRouter.delete("/", clearDataController.deleteAllData);
