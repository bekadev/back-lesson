import { ObjectId, WithId } from "mongodb";
import { usersCollection } from "../../db/mongo-db";
import type { User } from "./domain/user.entity";

export const usersRepository = {
  async create(user: User): Promise<string> {
    const newUser = await usersCollection.insertOne({ ...user });
    return newUser.insertedId.toString();
  },
  async delete(id: string): Promise<boolean> {
    if (!this._checkObjectId(id)) return false;
    const isDel = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    return isDel.deletedCount === 1;
  },
  async findById(id: string): Promise<WithId<User> | null> {
    if (!this._checkObjectId(id)) return null;
    return usersCollection.findOne({ _id: new ObjectId(id) });
  },
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
    return usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  },
  async findUserByConfirmationCode(emailConfirmationCode: string) {
    return usersCollection.findOne({
      "emailConfirmation.confirmationCode": emailConfirmationCode,
    });
  },
  async doesExistById(id: string): Promise<boolean> {
    if (!this._checkObjectId(id)) return false;
    const isUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    return !!isUser;
  },
  async doesExistByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<boolean> {
    const user = await usersCollection.findOne({
      $or: [{ email }, { login }],
    });
    return !!user;
  },
  async updateConfirmation(id: ObjectId) {
    let result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { confirmed: true } },
    );
    return result.modifiedCount === 1;
  },
  async update(user: WithId<User>): Promise<boolean> {
    const { _id, ...updateFields } = user;
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateFields },
    );
    return result.modifiedCount === 1;
  },
  async removeToken(refreshToken: any) {
    const tokenData = await usersCollection.deleteOne({ refreshToken });
    return tokenData;
  },
  _checkObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  },
};
