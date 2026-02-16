import { Type } from "@google/genai";

export const tools = [
  {
    name: "getSensors",
    description:
      "Returns all sensors if no parameters are provided. If `name` is provided, returns only the sensor with that name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "The name of the sensor to be searched, if provided",
          nullable: false,
        },
      },
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
        latitude: {
          type: Type.NUMBER,
          description: "The latitude at which the sensor is located",
        },
        longitude: {
          type: Type.NUMBER,
          description: "The longitude at which the sensor is located",
        },
        active: {
          type: Type.BOOLEAN,
          description:
            "Represent if the sensor is active (true) or inactive (false)",
        },
      },
      required: ["name", "latitude", "longitude"],
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
        oldName: {
          type: Type.STRING,
          description: "The old name of the sensor",
        },
        newName: {
          type: Type.STRING,
          description: "The new name of the sensor",
        },
      },
      required: ["oldName", "newName"],
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
        name: {
          type: Type.STRING,
          description: "The name of the sensor to be updated",
        },
      },
      required: ["active", "name"],
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
            "Represent if the sensors are to be set active (true) or inactive (false)",
        },
      },
      required: ["active"],
    },
  },
];
