export type UserRole = "admin" | "staff";

export interface AppUser {
  id: string;
  _id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  role: UserRole;
}