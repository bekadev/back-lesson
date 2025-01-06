export type LoginInputDto = {
  loginOrEmail: string;
  password: string;
};

export type LoginUserDto = {
  loginOrEmail: string;
  password: string;
  ip: string;
  userAgent: string;
};
