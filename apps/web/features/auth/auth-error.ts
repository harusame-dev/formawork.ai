export const AuthError = {
  InvalidCredentials: "InvalidCredentials",
  SessionExpired: "SessionExpired",
  UpdateFailed: "UpdateFailed",
  EmailExists: "EmailExists",
  CreateFailed: "CreateFailed",
  DeleteFailed: "DeleteFailed",
  SignOutFailed: "SignOutFailed",
  ListFailed: "ListFailed",
  Unknown: "Unknown",
} as const;
export type AuthError = (typeof AuthError)[keyof typeof AuthError];
