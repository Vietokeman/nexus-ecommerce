export interface User {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Maps to backend RegisterDto: { FirstName, LastName, Email, Password }
 * `confirmPassword` is frontend-only validation.
 */
export interface SignupDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  password: string;
  confirmPassword: string;
  userId: string;
  token: string;
}

export interface VerifyOtpDto {
  otp: string;
  userId: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
