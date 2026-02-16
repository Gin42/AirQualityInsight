import fetch from "node-fetch";
import { tools } from "./tools.js";

export const BACKEND_URL = process.env.BACKEND_URL || "http://server:3000";
const mainRoute = "/api/sensor";

function compactSensors(sensors) {
  return sensors.map((s) => ({
    id: s.sensor_id,
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

async function searchSensor(name = null) {
  const url =
    name == null
      ? `${BACKEND_URL}${mainRoute}`
      : `${BACKEND_URL}${mainRoute}?query=${encodeURIComponent(
          JSON.stringify({ name }),
        )}`;

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  const sensors = await res.json();
  return sensors;
}

const toolHandlers = {
  getSensors: async ({ name = null }) => {
    const sensors = await searchSensor(name);
    if (!sensors.length) {
      throw new Error(`Sensor "${name}" not found`);
    }
    return {
      action: name ? "get_single_sensor" : null,
      sensors: compactSensors(sensors),
    };
  },

  addSensor: async ({ name, latitude, longitude, active = true }) => {
    if (!name || longitude == null || latitude == null) {
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
          coordinates: [Number(latitude), Number(longitude)],
        },
        active: active,
        last_seen: new Date(),
      }),
    });

    if (!res.ok) throw new Error(`Backend error: ${res.status}`);

    const sensor = await res.json();
    return {
      action: "add_sensor",
      sensors: compactSensors([sensor]),
    };
  },

  deleteSensor: async ({ name }) => {
    if (!name) {
      throw new Error("Missing required sensor fields");
    }

    const selectedSensor = await searchSensor(name);

    if (!selectedSensor.length) {
      throw new Error(`Sensor "${name}" not found`);
    }

    const response = await fetch(
      `${BACKEND_URL}${mainRoute}/${selectedSensor[0].sensor_id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);

    const result = await response.json();
    return {
      sensors: result,
    };
  },
  updateSensor: async ({ oldName, newName }) => {
    if (!oldName || !newName) {
      throw new Error("Missing required sensor fields");
    }

    const selectedSensor = await searchSensor(oldName);

    if (!selectedSensor.length) {
      throw new Error(`Sensor "${oldName}" not found`);
    }

    const response = await fetch(
      `${BACKEND_URL}${mainRoute}/${selectedSensor[0].sensor_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      },
    );

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);

    const result = await response.json();
    return {
      action: "update_sensor",
      sensors: result,
    };
  },
  updateSensorStatus: async ({ name, active }) => {
    if (!name || active == null) {
      throw new Error("Missing required sensor fields");
    }

    const selectedSensor = await searchSensor(name);

    if (!selectedSensor.length) {
      throw new Error(`Sensor "${name}" not found`);
    }

    const response = await fetch(
      `${BACKEND_URL}${mainRoute}/${selectedSensor[0].sensor_id}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      },
    );

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);

    const result = await response.json();
    return {
      action: "update_sensor_status",
      sensors: result,
    };
  },
  updateAllSensorStatus: async ({ active }) => {
    if (active == null) {
      throw new Error("Missing required sensor fields");
    }

    const response = await fetch(`${BACKEND_URL}${mainRoute}/setAllStatus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedStatus: active }),
    });

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);

    const result = await response.json();
    return {
      sensors: result,
    };
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

  const normalizedArgs = {};
  for (const key of Object.keys(argsInput)) {
    normalizedArgs[key.toLowerCase()] = argsInput[key];
  }

  for (const field of required) {
    if (!(field.toLowerCase() in normalizedArgs)) return false;
  }

  toolCall.arguments = normalizedArgs;
  return true;
}
