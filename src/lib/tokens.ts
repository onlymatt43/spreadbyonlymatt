import crypto from "node:crypto";

export function createPlainToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
