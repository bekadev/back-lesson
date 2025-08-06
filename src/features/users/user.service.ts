import { bcryptService } from "../../common/adapters/bcrypt.service";
import { CreateUserInputDto } from "./types/create.user.input.dto";
import { IUserDB } from "./types/user.db.interface";
import { UsersRepository } from "./user.repository";

type CreateUserResult =
  | { success: true; userId: string }
  | { success: false; errorsMessages: { field: string; message: string }[] };

export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}
  async create(dto: CreateUserInputDto): Promise<CreateUserResult> {
    const { login, password, email } = dto;

    const existingUserByLogin = await this.usersRepository.findByLoginOrEmail(login);
    if (existingUserByLogin) {
      return {
        success: false,
        errorsMessages: [{ field: "login", message: "login should be unique" }],
      };
    }

    const existingUserByEmail = await this.usersRepository.findByLoginOrEmail(email);
    if (existingUserByEmail) {
      return {
        success: false,
        errorsMessages: [{ field: "email", message: "email should be unique" }],
      };
    }

    const passwordHash = await bcryptService.generateHash(password);
    const newUser: IUserDB = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
      emailConfirmation: {
        //default value can be nullable
        confirmationCode: "",
        isConfirmed: true,
        //default value can be nullable
        expirationDate: new Date(),
      },
    };

    const userId = await this.usersRepository.create(newUser);
    return { success: true, userId };
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.usersRepository.findById(id);
    if (!user) return false;

    return await this.usersRepository.delete(id);
  }
}