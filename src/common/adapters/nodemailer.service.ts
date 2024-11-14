// import nodemailer from "nodemailer";
// import {appConfig} from "../../../../../../../Downloads/ed-back-lessons-sprint-2-lesson-5/src/common/config/config";
//
// export const nodemailerService = {
//
//     async sendEmail(email: string, code: string, template: (code: string) => string): Promise<boolean> {
//         let transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: appConfig.EMAIL,
//                 pass: appConfig.EMAIL_PASS,
//             },
//         });
//
//         let info = await transporter.sendMail({
//             from: '"Kek 👻" <codeSender>',
//             to: email,
//             subject: "Your code is here",
//             html: template(code), // html body
//         });
//
//         return !!info;
//
//     }
// }