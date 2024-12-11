import { body } from "express-validator";
import { usersRepository } from "../user.repository";

export const loginValidation = body("login")
  .isString()
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage("login is not correct")
  .custom(async (login: string) => {
    const user = await usersRepository.findByLoginOrEmail(login);
    if (user) {
      throw new Error("login already exist");
    }
    return true;
  });
