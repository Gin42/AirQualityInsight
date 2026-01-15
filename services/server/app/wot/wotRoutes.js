// wot/wotRoutes.js
const express = require("express");
const router = express.Router();

const { registeredSensors, latestMeasurements } = require("./wotGateway");

// Get all Things (WoT Directory)
router.get("/things", (req, res) => {
  const directory = Array.from(registeredSensors.values()).map((thing) => ({
    id: thing.id,
    title: thing.thingDescription.title,
    description: thing.thingDescription.description,
    base: thing.thingDescription.base,
    status: thing.status,
    lastContact: thing.lastContact,
    properties: Object.keys(thing.thingDescription.properties),
    actions: Object.keys(thing.thingDescription.actions),
  }));

  res.json(directory);
});

router.get("/things/:sensorId", (req, res) => {
  const thing = registeredSensors.get(req.params.sensorId);
  if (!thing) return res.status(404).json({ error: "Thing not found" });
  res.json(thing.thingDescription);
});

router.get("/things/:sensorId/properties/:propertyName", (req, res) => {
  const { sensorId, propertyName } = req.params;
  const thing = registeredSensors.get(sensorId);

  if (!thing) return res.status(404).json({ error: "Thing not found" });

  const measurement = latestMeasurements.get(sensorId);
  if (!measurement)
    return res.status(404).json({ error: "No measurements available" });

  let value = measurement[propertyName];

  if ("location" === propertyName) {
    value = null;

    if (thing.sensor.location && thing.sensor.location.coordinates)
      value = {
        latitude: thing.sensor.location.coordinates[0],
        longitude: thing.sensor.location.coordinates[1],
      };
  }

  if ("status" === propertyName) value = thing.status;

  if (value === undefined)
    return res.status(404).json({ error: "Property not found" });

  res.json({ value });
});

router.get("/things/:sensorId/properties", (req, res) => {
  const sensorId = req.params.sensorId;
  const thing = registeredSensors.get(sensorId);

  if (!thing) return res.status(404).json({ error: "Thing not found" });

  const measurement = latestMeasurements.get(sensorId);
  if (!measurement)
    return res.status(404).json({ error: "No measurements available" });

  const properties = {
    temperature: { value: measurement.temperature },
    humidity: { value: measurement.humidity },
    pressure: { value: measurement.pressure },
    voc: { value: measurement.voc },
    co2: { value: measurement.co2 },
    pm25: { value: measurement.pm25 },
    pm10: { value: measurement.pm10 },
    no2: { value: measurement.no2 },
    o3: { value: measurement.o3 },
    so2: { value: measurement.so2 },
    status: { value: thing.status },
  };

  if (thing.sensor.location && thing.sensor.location.coordinates)
    properties.location = {
      value: {
        latitude: thing.sensor.location.coordinates[0],
        longitude: thing.sensor.location.coordinates[1],
      },
    };

  res.json(properties);
});

router.get("/things/:sensorId/actions/:actionName", (req, res) => {
  const { sensorId, actionName } = req.params;
  const thing = registeredSensors.get(sensorId);

  if (!thing) return res.status(404).json({ error: "Thing not found" });

  if ("getLatestMeasurement" === actionName) {
    const measurement = latestMeasurements.get(sensorId);
    if (!measurement)
      return res.status(404).json({ error: "No measurements available" });
    res.json({ result: measurement });
  }

  res.status(404).json({ error: "Action not found" });
});

module.exports = router;
