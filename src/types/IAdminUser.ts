export enum AdminStatus {
  DISABLED = 0,
  ENABLED = 1,
}

export interface IAdminUser {
  id?: number;
  username?: string;
  password?: string;
  avatar?: string;
  status?: AdminStatus;
  token?: string;
}
