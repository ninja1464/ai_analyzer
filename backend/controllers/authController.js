import { createHash } from "crypto";
import { readDB } from "../db.js";
import { generateAuthToken } from "../services/authService.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const users = await readDB("users.json");
    const user = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const computedHash = createHash("sha256").update(password).digest("hex");
    if (computedHash !== user.passwordHash) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const token = generateAuthToken(user.id);
    return res.status(200).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        token,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
