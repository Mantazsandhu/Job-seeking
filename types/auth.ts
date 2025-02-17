// app/types/auth.ts
export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
  referredBy?: string;
}

export interface AuthResponse {
  message: string;
}
