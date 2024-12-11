import { body } from "express-validator";

export const codeValidation = body("code")
  .isString()
  .trim()
  .withMessage("code is not correct");
