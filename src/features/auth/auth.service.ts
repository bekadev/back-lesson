import { WithId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { bcryptService } from "../../common/adapters/bcrypt.service";
import { emailExamples } from "../../common/adapters/emailExamples";
import { jwtService } from "../../common/adapters/jwt.service";
import { nodemailerService } from "../../common/adapters/nodemailer.service";
import { appConfig } from "../../common/config/config";
import { ResultType } from "../../common/result/result.type";
import { ResultStatus } from "../../common/result/resultCode";
import { resultHelpers } from "../../common/result/resultHelpers";
import type { IdType } from "../../common/types/id";
import type { RefreshTokenPayload } from "../../common/types/refreshToken";
import type { SessionsDBModel } from "../session/session.types";
import { User } from "../users/domain/user.entity";
import type { IUserDB } from "../users/types/user.db.interface";
import { UsersRepository } from "../users/user.repository";
import type { LoginUserDto } from "./types/login.input.dto";
import { DeviceRepository } from "../session/session.repository";

export class AuthService {
  constructor(protected deviceRepository: DeviceRepository, protected usersRepository: UsersRepository) {}
  async loginUser({ loginOrEmail, password, ip, userAgent }: LoginUserDto) {
    const result = await this.checkUserCredentials(loginOrEmail, password);

    if (!resultHelpers.isSuccess(result)) {
      return resultHelpers.unauthorized();
    }

    const userId = result.data?._id.toString()!;
    const deviceId = uuidv4();

    const accessToken = await jwtService.createToken(userId);
    const refreshToken = await this.generateRefreshToken(
      userId,
      deviceId,
    );

    const decodedToken = (await jwtService.decodeToken(
      refreshToken,
    )) as RefreshTokenPayload;

    const newSession: SessionsDBModel = {
      user_id: userId,
      device_id: deviceId,
      user_agent: userAgent,
      ip: ip,
      iat: decodedToken.iat!,
      exp: decodedToken.exp!,
    };

    await this.deviceRepository.createSession(newSession);

    // console.log("newSession: ", newSession);

    return resultHelpers.success({ accessToken, refreshToken });
  }

  async logOutUser(token: string) {
    const result = await jwtService.verifyToken(token, appConfig.RT_SECRET);

    if (!resultHelpers.isSuccess(result)) {
      return resultHelpers.unauthorized();
    }

    const doesSessionExist = await this.deviceRepository.doesSessionExists(
      result.data as RefreshTokenPayload,
    );

    if (!doesSessionExist) {
      return resultHelpers.unauthorized();
    }

    const userId = result.data?.userId!;
    const deviceId = result.data?.deviceId!;

    await this.deviceRepository.deleteSession(userId, deviceId);

    return resultHelpers.success(true);
  }

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<ResultType<WithId<IUserDB> | null>> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
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
  }
  async registerUser(
    login: string,
    pass: string,
    email: string,
  ): Promise<ResultType<User | null>> {
    const user = await this.usersRepository.doesExistByLoginOrEmail(login, email);
    if (user)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "loginOrEmail", message: "Already Registered" }],
      };

    const passwordHash = await bcryptService.generateHash(pass);

    const newUser = new User(login, email, passwordHash);

    await this.usersRepository.create(newUser);

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
  }

  async generateRefreshToken(
    userId: string,
    deviceId: string,
  ): Promise<string> {
    return jwtService.createRefreshToken(userId, deviceId);
  }

  async confirmEmail(code: string): Promise<ResultType<any> | boolean> {
    const user = await this.usersRepository.findUserByConfirmationCode(code);
    if (!user)
      return {
        status: ResultStatus.NotFound,
        data: null,
        extensions: [],
      };

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

    if (user.emailConfirmation.confirmationCode !== code) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    if (user.emailConfirmation.expirationDate > new Date()) {
      return await this.usersRepository.updateConfirmation(user._id);
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async checkAccessToken(authHeader: string) {
    const [type, token] = authHeader.split(" ");

    const result = await jwtService.verifyToken(token, appConfig.AC_SECRET);

    if (!result) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        data: null,
        extensions: [{ field: null, message: "Havent payload" }],
      };
    }

    return {
      status: ResultStatus.Success,
      data: result.data?.userId,
      extensions: [],
    };
  }

  async checkRefreshToken(token: string): Promise<ResultType<IdType | null>> {
    const result = await jwtService.verifyToken(token, appConfig.RT_SECRET);

    console.log("result checkRefreshToken", result);

    if (!resultHelpers.isSuccess(result)) {
      console.log("MMEEEEEEE");
      return resultHelpers.unauthorized();
    }

    // Проверяем, существует ли сессия в базе данных
    const doesSessionExists = await this.deviceRepository.doesSessionExists(
      result.data as RefreshTokenPayload,
    );

    if (!doesSessionExists) {
      console.log("Session does not exist");
      return resultHelpers.unauthorized();
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }
}
