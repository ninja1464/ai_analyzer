import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { findOne, insertOne } from "../db.js";
import { generateAuthToken } from "../services/authService.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await findOne("users", { email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "A user with that email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await insertOne("users", newUser);
    const token = generateAuthToken(newUser.id);

    return res.status(201).json({
      success: true,
      data: {
        user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
        token,
      },
    });
  } catch (error) {
    console.error("USER CREATE ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
