import * as bcrypt from "bcryptjs";
export { signToken, verifyToken, COOKIE_NAME, type TokenPayload } from "./jwt";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}
