import { createHmac, timingSafeEqual } from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "change_this_secret";
const TOKEN_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

export function generateAuthToken(userId) {
  const issued = Date.now().toString();
  const payload = `${userId}.${issued}`;
  const signature = createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifyAuthToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, issued, signature] = parts;
  if (!userId || !issued || !signature) return null;

  const payload = `${userId}.${issued}`;
  const expected = createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  if (Date.now() - Number(issued) > TOKEN_TTL) {
    return null;
  }

  return { userId, issued: Number(issued) };
}
