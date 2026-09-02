import crypto from "crypto";

const JWT_SECRET = process.env.ADMIN_SECRET || "liquid-glass-visionos-admin-secret-key-2026";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(originalHash));
  } catch {
    return false;
  }
}

export function createSessionToken(username: string): string {
  const payload = JSON.stringify({
    username,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): { valid: boolean; username?: string } {
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return { valid: false };

    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(encodedPayload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, username: payload.username };
  } catch {
    return { valid: false };
  }
}
