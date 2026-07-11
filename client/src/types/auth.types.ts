export type UserRole = "admin" | "doctor" | "receptionist";

export interface NotificationPreferences {
  criticalAlerts: boolean;
  dailySummary: boolean;
  aiSuggestions: boolean;
}

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  doctorId?: string | null;
  notificationPreferences?: NotificationPreferences;
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

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface DeactivateAccountPayload {
  currentPassword: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: SelfRegisterableRole;
  department?: string;
}
