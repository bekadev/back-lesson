import {body} from "express-validator";

export const emailValidation = body("email")
.isString()
.trim()
.isLength({min: 1})
.isEmail()
.withMessage("email is not correct")
// .custom(
//     async (email: string) => {
//         const user = await usersRepository.findByLoginOrEmail(email);
//         if (user) {
//             throw new Error("email already exist");
//         }
//         return true;
//     });