// wot/wotGateway.js
const Sensor = require("../sensors/sensorModel.js");

// WoT Gateway state
const registeredSensors = new Map();
const latestMeasurements = new Map();

function createThingDescription(sensor, port, sensor) {
  const baseUrl = `http://localhost:${port}/wot/things/${sensor.sensor_id}`;

  /** @see https://www.w3.org/TR/wot-thing-description11/#introduction-td */
  return {
    "@context": [
      "https://www.w3.org/2022/wot/td/v1.1",
      {
        saref: "https://saref.etsi.org/core/",
      },
    ],
    "@type": ["Thing", "saref:Sensor"],
    id: `urn:sensor:air-quality:${sensor.sensor_id}`,
    title: sensor.name || `Air Quality Sensor ${sensor.sensor_id}`,
    description: `Air Quality Sensor monitoring environmental parameters at ${
      sensor.location?.coordinates || "Unknown location"
    }`,
    base: baseUrl,
    securityDefinitions: {
      nosec_sc: { scheme: "nosec" },
    },
    security: ["nosec_sc"],
    /** @see https://www.w3.org/TR/wot-thing-description11/#property-serialization-json */
    properties: {
      temperature: {
        type: "number",
        title: "Temperature",
        description: "Ambient temperature in Celsius",
        unit: "°C",
        minimum: -15,
        maximum: 35,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/temperature`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      humidity: {
        type: "number",
        title: "Humidity",
        description: "Relative humidity percentage",
        unit: "%",
        minimum: 30,
        maximum: 100,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/humidity`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      pressure: {
        type: "number",
        title: "Atmospheric Pressure",
        description: "Atmospheric pressure in hectopascals",
        unit: "hPa",
        minimum: 980,
        maximum: 1020,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/pressure`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      voc: {
        type: "number",
        title: "VOC",
        description: "Volatile Organic Compounds concentration",
        unit: "ppm",
        minimum: 0,
        maximum: 3,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/voc`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      co2: {
        type: "number",
        title: "CO2",
        description: "Carbon dioxide concentration",
        unit: "ppm",
        minimum: 400,
        maximum: 2000,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/co2`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      pm25: {
        type: "number",
        title: "PM2.5",
        description: "Fine particulate matter (≤2.5μm)",
        unit: "μg/m³",
        minimum: 0,
        maximum: 150,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/pm25`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      pm10: {
        type: "number",
        title: "PM10",
        description: "Coarse particulate matter (≤10μm)",
        unit: "μg/m³",
        minimum: 0,
        maximum: 300,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/pm10`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      no2: {
        type: "number",
        title: "NO2",
        description: "Nitrogen dioxide concentration",
        unit: "μg/m³",
        minimum: 0,
        maximum: 200,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/no2`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      o3: {
        type: "number",
        title: "O3",
        description: "Ozone concentration",
        unit: "μg/m³",
        minimum: 0,
        maximum: 200,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/o3`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      so2: {
        type: "number",
        title: "SO2",
        description: "Sulfur dioxide concentration",
        unit: "μg/m³",
        minimum: 0,
        maximum: 300,
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/so2`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      status: {
        type: "string",
        title: "Status",
        description: "Current sensor status",
        enum: ["active", "inactive"],
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/status`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
      location: {
        type: "object",
        title: "Location",
        description: "Sensor geographical location",
        properties: {
          latitude: { type: "number" },
          longitude: { type: "number" },
        },
        readOnly: true,
        observable: false,
        forms: [
          {
            href: `${baseUrl}/properties/location`,
            contentType: "application/json",
            op: ["readproperty"],
          },
        ],
      },
    },
    /** @see https://www.w3.org/TR/wot-thing-description11/#action-serialization-json */
    actions: {
      getLatestMeasurement: {
        title: "Get Latest Measurement",
        description: "Get the latest complete measurement from this sensor",
        forms: [
          {
            href: `${baseUrl}/actions/getLatestMeasurement`,
            contentType: "application/json",
            op: ["invokeaction"],
          },
        ],
      },
    },
  };
}

/**
 * Initialize gateway from DB
 */
async function initializeWoTGateway(io, port) {
  try {
    const sensors = await Sensor.find({});
    console.log(`Loading ${sensors.length} sensors for WoT Gateway...`);

    for (const sensor of sensors) {
      const thingDescription = createThingDescription(sensor, port, sensor);

      registeredSensors.set(sensor.sensor_id, {
        id: sensor.sensor_id,
        sensor: sensor,
        thingDescription: thingDescription,
        status: "active",
        lastContact: new Date(),
      });
    }

    console.log(
      `WoT Gateway initialized with ${registeredSensors.size} Things`
    );

    io.emit("wot-directory", Array.from(registeredSensors.values()));
  } catch (error) {
    console.error("Error initializing WoT Gateway:", error);
  }
}

module.exports = {
  registeredSensors,
  latestMeasurements,
  initializeWoTGateway,
};
