export type UserRole = "admin" | "doctor" | "receptionist" | "patient";

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  doctorId?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export type SelfRegisterableRole = "doctor" | "receptionist";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: SelfRegisterableRole;
}
