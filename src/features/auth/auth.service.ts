import { WithId } from "mongodb";
import { bcryptService } from "../../common/adapters/bcrypt.service";
import { emailExamples } from "../../common/adapters/emailExamples";
import { jwtService } from "../../common/adapters/jwt.service";
import { nodemailerService } from "../../common/adapters/nodemailer.service";
import { Result } from "../../common/result/result.type";
import { ResultStatus } from "../../common/result/resultCode";
import { User } from "../users/domain/user.entity";
import type { IUserDB } from "../users/types/user.db.interface";
import { usersRepository } from "../users/user.repository";

export const authService = {
  async loginUser(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<{ accessToken: string } | null>> {
    const result = await this.checkUserCredentials(loginOrEmail, password);
    //TODO replace with helper function
    if (result.status !== ResultStatus.Success)
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        extensions: [{ field: "loginOrEmail", message: "Wrong credentials" }],
        data: null,
      };

    const accessToken = await jwtService.createToken(
      result.data!._id.toString(),
    );

    return {
      status: ResultStatus.Success,
      data: { accessToken },
      extensions: [],
    };
  },

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<WithId<IUserDB> | null>> {
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user)
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "loginOrEmail", message: "Not Found" }],
      };

    const isPassCorrect = await bcryptService.checkPassword(
      password,
      user.passwordHash,
    );
    if (!isPassCorrect)
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: "Bad Request",
        extensions: [{ field: "password", message: "Wrong password" }],
      };

    return {
      status: ResultStatus.Success,
      data: user,
      extensions: [],
    };
  },
  async registerUser(
    login: string,
    pass: string,
    email: string,
  ): Promise<Result<User | null>> {
    const user = await usersRepository.doesExistByLoginOrEmail(login, email);
    if (user)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "loginOrEmail", message: "Already Registered" }],
      };

    const passwordHash = await bcryptService.generateHash(pass);

    const newUser = new User(login, email, passwordHash);

    await usersRepository.create(newUser);

    nodemailerService
      .sendEmail(
        newUser.email,
        newUser.emailConfirmation.confirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((er) => console.error("error in send email:", er));
    return {
      status: ResultStatus.Success,
      data: newUser,
      extensions: [],
    };
  },

  async confirmEmail(code: string): Promise<Result<any>> {
    //some logic

    const isUuid = new RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ).test(code);

    if (!isUuid) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "code", message: "Incorrect code" }],
      };
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },
};
