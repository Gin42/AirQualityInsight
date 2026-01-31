import express from "express";
import router from "./src/chat.js";
import cors from "cors";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());

app.use(express.json());

app.use("/chat", router);

app.get("/health", (req, res) => res.send("OK"));

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
