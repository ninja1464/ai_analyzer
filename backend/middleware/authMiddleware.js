import { readDB } from "../db.js";
import { verifyAuthToken } from "../services/authService.js";

async function loadUser(userId) {
  const users = await readDB("users.json");
  return users.find((user) => user.id === userId) || null;
}

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Authorization required" });
    }

    const token = header.replace("Bearer ", "").trim();
    const payload = verifyAuthToken(token);
    if (!payload) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid or expired token" });
    }

    const user = await loadUser(payload.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = { id: user.id, name: user.name, email: user.email };
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next();
    }

    const token = header.replace("Bearer ", "").trim();
    const payload = verifyAuthToken(token);
    if (!payload) {
      return next();
    }

    const user = await loadUser(payload.userId);
    if (!user) {
      return next();
    }

    req.user = { id: user.id, name: user.name, email: user.email };
    return next();
  } catch (error) {
    console.error("OPTIONAL AUTH ERROR:", error);
    return next();
  }
};
