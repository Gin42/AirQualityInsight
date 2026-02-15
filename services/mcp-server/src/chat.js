import express from "express";
import { executeTool, validateToolCall } from "./tools/toolExecutor.js";
import { tools } from "./tools/tools.js";
import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "./systemPrompt.js";

const MODEL = "gemini-2.5-flash";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const config = {
  system_instruction: systemPrompt,
  tools: [{ functionDeclarations: tools }],
};

const router = express.Router();

async function askAi(contents, retries = 3) {
  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents,
      config,
    });
    return result;
  } catch (err) {
    if (err.status === 503 && retries > 0) {
      const delay = (4 - retries) * 500;
      await new Promise((r) => setTimeout(r, delay));
      return askAi(contents, retries - 1);
    }
    throw err;
  }
}

router.post("/", async (req, res) => {
  const userMessage = req.body.message;

  const contents = [
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  let toolResult = null;

  try {
    const response = await askAi(contents);
    let content = response.candidates[0].content;

    const functionCalls = content.parts?.filter((p) => p.functionCall) ?? [];

    if (functionCalls.length > 0) {
      const toolCall = functionCalls[0].functionCall;

      if (!validateToolCall(toolCall)) {
        throw new Error("Invalid tool call received from model");
      }

      console.log("toolCall name:", toolCall.name);

      toolResult = await executeTool(toolCall.name, toolCall.args);

      contents.push({
        role: "model",
        parts: content.parts,
      });

      contents.push({
        role: "function",
        parts: [
          {
            functionResponse: {
              name: toolCall.name,
              response: { result: toolResult.sensors },
            },
          },
        ],
      });

      const finalResponse = await askAi(contents);
      content = finalResponse.candidates[0].content;
    }

    const text =
      content.parts
        ?.filter((p) => p.text)
        .map((p) => p.text)
        .join("\n") ?? "";

    return res.json({ answer: text, toolResult: toolResult });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
