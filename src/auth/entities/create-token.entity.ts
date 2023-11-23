export class TokensEntity {
  accessToken: string;

  refreshToken: string;
  constructor({ accessToken, refreshToken }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
