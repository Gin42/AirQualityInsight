export const tools = [
  {
    type: "function",
    function: {
      name: "getSensors",
      description: "Get a list of all air quality sensors",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addSensor",
      description:
        "Add a new sensor to the database. The sensor needs to have a name, a latitude and longitude and can be active or inactive",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the sensor",
          },
          longitude: {
            type: "number",
            description: "The longitude at which the sensor is located",
          },
          latitude: {
            type: "number",
            description: "The latitude at which the sensor is located",
          },
          active: {
            type: "boolean",
            description:
              "Represent if the sensor is active (true) or inactive (false)",
          },
        },
        required: ["name", "longitude", "latitude", "active"],
      },
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
