export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  surname: string;
  username: string;
  password: string;
  role: UserRole;
}
