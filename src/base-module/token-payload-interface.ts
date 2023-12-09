export type TokenPayloadType = {
  user: UserTokenPayloadType;
};
export type UserTokenPayloadType = {
  id: number;
  name: string;
  email: string;
};
