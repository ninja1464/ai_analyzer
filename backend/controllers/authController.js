import { createHash } from "crypto";
import bcrypt from "bcrypt";
import { findOne, updateOne } from "../db.js";
import { generateAuthToken } from "../services/authService.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await findOne("users", { email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    let isValid = false;
    const isBcrypt = user.passwordHash.startsWith("$2b$");

    if (isBcrypt) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Legacy SHA-256 hash — verify then silently upgrade to bcrypt
      const sha256 = createHash("sha256").update(password).digest("hex");
      isValid = sha256 === user.passwordHash;
      if (isValid) {
        const newHash = await bcrypt.hash(password, 12);
        await updateOne("users", { id: user.id }, { $set: { passwordHash: newHash } });
      }
    }

    if (!isValid) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateAuthToken(user.id);
    return res.status(200).json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, token },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    return res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
