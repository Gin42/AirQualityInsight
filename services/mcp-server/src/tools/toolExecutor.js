import fetch from "node-fetch";
import { tools } from "./tools.js";

export const BACKEND_URL = process.env.BACKEND_URL || "http://server:3000";
const mainRoute = "/api/sensor";

function compactSensors(sensors) {
  return sensors.map((s) => ({
    name: s.name,
    location: s.location?.coordinates,
    status: s.active ? "active" : "inactive",
  }));
}

const toolHandlers = {
  getSensors: async () => {
    const res = await fetch(`${BACKEND_URL}${mainRoute}/`);
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const sensors = await res.json();
    return compactSensors(sensors);
  },

  addSensor: async ({ name, longitude, latitude, active }) => {
    if (!name || longitude == null || latitude == null || active == null) {
      throw new Error("Missing required sensor fields");
    }

    const res = await fetch(`${BACKEND_URL}${mainRoute}/addSensor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        location: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        active: active,
        last_seen: new Date(),
      }),
    });

    if (!res.ok) throw new Error(`Backend error: ${res.status}`);

    const sensor = await res.json();
    return compactSensors([sensor]);
  },
};

export async function executeTool(toolName, args) {
  const handler = toolHandlers[toolName];
  if (!handler) throw new Error(`Unknown tool: ${toolName}`);
  return handler(args);
}

export function validateToolCall(toolCall) {
  if (!toolCall || typeof toolCall !== "object") return false;
  if (!toolCall.name) return false;
  const toolDef = tools.find((t) => t.function.name === toolCall.name);
  if (!toolDef) return false;
  if (toolCall.arguments && typeof toolCall.arguments !== "object")
    return false;

  const required = toolDef.function.parameters.required || [];
  for (const field of required) {
    if (!(field in toolCall.arguments)) return false;
  }

  return true;
}
