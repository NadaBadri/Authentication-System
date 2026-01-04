import jwt from "jsonwebtoken";
import { env } from "./env.js";

export type JwtPayload = {
  sub: string;
  role: "user" | "admin";
};

export function signAuthToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtSecret as jwt.Secret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"]
  });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, env.jwtSecret as jwt.Secret) as JwtPayload & jwt.JwtPayload;
}

