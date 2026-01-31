import { Type } from "@google/genai";

export const tools = [
  {
    name: "getSensors",
    description:
      "Returns the authoritative list of all air quality sensors stored in the system. This is the ONLY valid source of sensor data.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: "addSensor",
    description:
      "Add a new sensor to the database. The sensor needs to have a name, a latitude and longitude and can be active or inactive",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "The name of the sensor",
        },
        longitude: {
          type: Type.NUMBER,
          description: "The longitude at which the sensor is located",
        },
        latitude: {
          type: Type.NUMBER,
          description: "The latitude at which the sensor is located",
        },
        active: {
          type: Type.BOOLEAN,
          description:
            "Represent if the sensor is active (true) or inactive (false)",
        },
      },
      required: ["name", "longitude", "latitude", "active"],
    },
  },
  {
    name: "deleteSensor",
    description: "Delete an existing sensor from the database.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "The name of the sensor",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "updateSensor",
    description: "Update an existing sensor name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "The new name of the sensor",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "updateSensorStatus",
    description: "Update an existing sensor status. Updates only one sensor.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        active: {
          type: Type.BOOLEAN,
          description:
            "Represent if the sensor is to be set active (true) or inactive (false)",
        },
      },
      required: ["active"],
    },
  },
  {
    name: "updateAllSensorStatus",
    description: "Update all existing sensor status.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        active: {
          type: Type.BOOLEAN,
          description:
            "Represent if the sensor are to be set active (true) or inactive (false)",
        },
      },
      required: ["active"],
    },
  },
];

/**
 * TOOLS:
 * chiedi un sensore per nome,
 */
