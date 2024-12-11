import { body } from "express-validator";
import { usersRepository } from "../user.repository";

export const emailValidation = body("email")
  .isString()
  .trim()
  .isLength({ min: 1 })
  .isEmail()
  .withMessage("email is not correct")
  .custom(async (email: string) => {
    const user = await usersRepository.findByLoginOrEmail(email);
    if (user) {
      throw new Error("email already exist");
    }
    return true;
  });

export const emailResendValidation = body("email")
  .isString()
  .trim()
  .isLength({ min: 1 })
  .isEmail()
  .withMessage("email is not correct")
  .custom(async (email: string) => {
    const user = await usersRepository.findByLoginOrEmail(email);
    if (!user) {
      throw new Error("User with this email does not exist");
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new Error("Email is already confirmed");
    }
    return true;
  });
