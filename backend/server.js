import app from "./app.js";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { connectDB, findOne, insertOne } from "./db.js";

const port = process.env.PORT || 5001;
const defaultEmail = process.env.DEFAULT_USER_EMAIL || "admin@example.com";
const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "Password123!";

async function ensureDefaultUser() {
  const normalizedEmail = defaultEmail.toLowerCase();
  const existingUser = await findOne("users", { email: normalizedEmail });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(defaultPassword, 12);
    const newUser = {
      id: randomUUID(),
      name: "ResumeAI Admin",
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    await insertOne("users", newUser);
    console.log(`Created default login user: ${defaultEmail}`);
  } else {
    console.log(`Default login user already exists: ${defaultEmail}`);
  }
}

(async () => {
  await connectDB();
  await ensureDefaultUser();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();
