export interface UserInfo {
  userId: string;
  email: string;
  displayName: string;
  roles: string[];
  hasPassword: boolean;
}

export interface AuthResponse {
  userId: string;
  email: string;
  displayName: string;
  roles: string[];
  hasPassword: boolean;
}
