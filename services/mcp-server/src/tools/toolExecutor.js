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

function isValidWGS84(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") return false;

  if (Number.isNaN(lat) || Number.isNaN(lon)) return false;

  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
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

    if (!isValidWGS84(latitude, longitude)) {
      throw new Error("Latitude and longitude are not valid");
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

  deleteSensor: async ({ name }) => {
    if (!name) {
      throw new Error("Missing required sensor fields");
    }
    const queryParam = `?query=${encodeURIComponent(JSON.stringify({ name }))}`;

    const res = await fetch(`${BACKEND_URL}${mainRoute}/${queryParam}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`Backend error: ${res.status}`);

    const selectedSensor = await res.json();

    console.log(JSON.stringify(selectedSensor));

    const response = await fetch(
      `${BACKEND_URL}${mainRoute}/${selectedSensor[0].sensor_id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);

    const result = await response.json();
    return result;
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

  const toolDef = tools.find((t) => t.name === toolCall.name);
  if (!toolDef) return false;

  const required = toolDef.parameters?.required || [];

  const argsInput = toolCall.arguments || toolCall.args || {};
  const lowerArgs = {};
  for (const key of Object.keys(argsInput)) {
    lowerArgs[key.toLowerCase()] = argsInput[key];
  }

  for (const field of required) {
    if (!(field.toLowerCase() in lowerArgs)) return false;
  }
  toolCall.arguments = {};
  for (const field of required) {
    toolCall.arguments[field] = lowerArgs[field.toLowerCase()];
  }

  return true;
}
