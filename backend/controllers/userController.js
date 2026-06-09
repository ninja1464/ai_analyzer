import { randomUUID, createHash } from "crypto";
import { readDB, writeDB } from "../db.js";
import { generateAuthToken } from "../services/authService.js";

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "name, email, and password are required",
      });
    }

    const users = await readDB("users.json");
    const existing = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "A user with that email already exists",
      });
    }

    const newUser = {
      id: randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeDB(users, "users.json");
    const token = generateAuthToken(newUser.id);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("USER CREATE ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
