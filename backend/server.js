import app from "./app.js";
import { randomUUID, createHash } from "crypto";
import { readDB, writeDB } from "./db.js";

const port = process.env.PORT || 5001;
const defaultEmail = process.env.DEFAULT_USER_EMAIL || "admin@example.com";
const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "Password123!";

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

async function ensureDefaultUser() {
  const users = await readDB("users.json");
  const existingUser = users.find(
    (user) => user.email.toLowerCase() === defaultEmail.toLowerCase(),
  );

  if (!existingUser) {
    const newUser = {
      id: randomUUID(),
      name: "ResumeAI Admin",
      email: defaultEmail,
      passwordHash: hashPassword(defaultPassword),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeDB(users, "users.json");
    console.log(`Created default login user: ${defaultEmail}`);
    console.log(`Default password: ${defaultPassword}`);
  } else {
    console.log(`Default login user already exists: ${defaultEmail}`);
  }
}

(async () => {
  await ensureDefaultUser();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Upload endpoint: POST http://localhost:${port}/api/resume`);
  });
})();
