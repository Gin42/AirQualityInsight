import express from "express";
import { systemPrompt } from "./systemPrompt.js";
import { executeTool, validateToolCall } from "./tools/toolExecutor.js";
import { tools } from "./tools/tools.js";
import { Ollama } from "ollama";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://ollama:11434";
const MODEL = "functiongemma:270m";

const router = express.Router();
const ollama = new Ollama({ host: OLLAMA_API_URL });

// Send messages to Ollama
async function sendToOllama(messages, tool_calls = null) {
  const res = await ollama.chat({
    model: MODEL,
    messages: messages,
    tools: tools,
    tool_calls: tool_calls,
  });
  return res.message;
}

// Safely parse JSON from a string
function parseJSONSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function formatSensors(sensors) {
  return sensors.map(
    (s) => `- ${s.name} — [${s.location.join(", ")}] (${s.status})`,
  );
}

router.post("/", async (req, res) => {
  const userMessage = req.body.message;

  let messages = [];

  try {
    messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: userMessage });

    const toolResponse = await sendToOllama(messages);

    let toolCall = null;
    if (toolResponse.tool_calls && toolResponse.tool_calls.length > 0) {
      toolCall = toolResponse.tool_calls[0].function;
    } else if (toolResponse.content) {
      toolCall = parseJSONSafe(toolResponse.content);
    }

    toolCall = toolCall || { name: null, arguments: {} };

    if (toolCall && toolCall.name) {
      if (!validateToolCall(toolCall)) {
        throw new Error("Invalid tool call received from model");
      }

      const toolResult = await executeTool(
        toolCall.name,
        toolCall.arguments || {},
      );

      const bullets = formatSensors(toolResult);

      messages.push({
        role: "tool",
        content: bullets.join("\n"),
        name: toolCall.name,
      });

      console.log("MESSAGES:", JSON.stringify(messages, null, 2));

      const finalResponse = await ollama.chat({
        model: MODEL,
        messages,
      });

      //const contentString = bullets.join("\n");

      /*const help = await ollama.chat({
        model: "gemma3:270m",
        messages: [
          {
            role: "system",
            content: `
              You are an assistant.
              Start with repeating the user request in a friendly way and then include the content verbatim.
              `,
          },
          {
            role: "user",
            content: `
              User Request: ${userMessage}

              Tool Output:
              ${contentString}
                    `,
          },
        ],
      });

      const insidePrompt = `
        You are a helpful assistant.
        Whenever a tool is executed, you must:
        1. Start your reply with a friendly acknowledgment of the user's request.
        2. Include the tool result verbatim, exactly as provided.
        3. Format the output exactly as shown below:

        - Adding a sensor:
          Sure! Here's the added sensor:
          - sensor name — [lat, lon] (status)
        - Listing all sensors:
          Here's a list of all sensors:
          - sensor name — [lat, lon] (status)
          - sensor name — [lat, lon] (status)

        Do NOT change the tool output.
        `;

      console.log(
        `\nEAT THIS:\n Tool output:\n${formatSensors(toolResult).join("\n")}\n`,
      );

      const messages = [
        { role: "system", content: insidePrompt },
        { role: "user", content: userMessage },
        {
          role: "assistant",
          content: `${formatSensors(toolResult).join("\n")}`,
        },
      ];

      const response = await ollama.chat({
        model: "gemma3:270m",
        messages,
      });*/

      console.log("THE BIG REVEAL", finalResponse);

      /*const chunks = chunkArray(bullets, 5);
      let summaries = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        console.log("CHUCK CHUCK:", chunk);

        const result = await ollama.chat({
          model: "gemma3:270m",
          messages: [
            {
              role: "system",
              content: `
              You are an assistant.
              Start with "Here is the list of sensors:" and then include the content verbatim.
              `,
            },
            {
              role: "user",
              content: chunk.join("\n"),
            },
          ],
        });

        console.log(`Chunk ${i + 1} RAW:\n`, result.message.content);

        summaries.push(result.message.content.trim());
      }*/

      return res.json({
        answer: finalResponse.message.content,
        data: toolResult,
      });
    }

    console.log("No tool needed; returning model response");
    return res.json({ answer: toolResponse.message.content });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
