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
];

/**
 * TOOLS:
 * chiedi tutti i sensori,
 * chiedi un sensore per nome,
 * aggiunta sensore,
 * eliminazione sensore,
 * modifica sensore (nome),
 * modifica sensore (stato),
 * spegni/accendi tutti i sensori
 */
