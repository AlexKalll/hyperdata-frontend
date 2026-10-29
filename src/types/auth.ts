import { User as NextAuthUser } from "next-auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  role: string;
  token: string;
  isFirstTimeLogin: boolean;
}

export interface ApiError {
  error?: string;
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  email: string;
  code: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  exp: number;
}

export type UserRole = "Admin" | "ProjectManager" | "Facilitator" | "Reviewer";

export interface ExtendedUser extends NextAuthUser {
  id: string;
  email: string;
  name?: string | null;
  username: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  role: UserRole;
  access_token: string;
  profile_picture: string | null;
}
