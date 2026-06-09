import app from "./backend/app.js";

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Upload endpoint: POST http://localhost:${port}/api/resume`);
});
