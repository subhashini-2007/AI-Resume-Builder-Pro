import jwt from "jsonwebtoken";

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "fallback_jwt_secret_after_auth_reset_2026_v2";
};

export interface JWTPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "1d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}
