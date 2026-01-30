import express from "express";
import router from "./src/chat.js";

export const OLLAMA_API_URL =
  process.env.OLLAMA_API_URL || "http://ollama:11434";
export const BACKEND_URL = process.env.BACKEND_URL || "http://server:3000";
export const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());

app.use("/chat", router);

app.get("/health", (req, res) => res.send("OK"));

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
