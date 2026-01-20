// sensorService.js
const Sensor = require("./sensorModel");
const mongoose = require("mongoose");
const {
  addSensor,
  retryUntilAck,
  deleteSensor,
  updateSensor,
} = require("../kafka/producer");

const connectWithRetry = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://mongodb:27017/sensordata";

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000, // Give up initial connection after 10s
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

const countSensors = () => {
  return Sensor.countDocuments();
};

const addSensorData = async (sensorData) => {
  try {
    sensorData.sensor_id = `SENSOR${Date.now()}`;
    const sensor = Sensor(sensorData);
    const savedSensor = await sensor.save();

    await retryUntilAck(10, addSensor, {
      sensor_id: savedSensor.sensor_id,
      name: savedSensor.name,
      location: savedSensor.location,
      ip: savedSensor.ip,
      active: savedSensor.active,
      last_seen: savedSensor.last_seen,
    });

    return savedSensor;
  } catch (err) {
    console.error("Error adding sensor:", err);
    throw err;
  }
};

const deleteSensorData = async (sensorId) => {
  try {
    const deletedSensor = await Sensor.findOneAndDelete({
      sensor_id: sensorId,
    });

    console.log("DELETED: ", deletedSensor);

    if (!deletedSensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    await retryUntilAck(10, deleteSensor, {
      sensor_id: sensorId,
    });

    return deletedSensor;
  } catch (err) {
    console.error("Error deleting sensor:", err);
    throw err;
  }
};

const modifySensorData = async (sensorId, sensorName) => {
  try {
    if (await isNameTaken(sensorName, sensorId)) {
      throw new Error(`Sensor name ${sensorName} already used`);
    }

    const modifiedSensor = await Sensor.findOneAndUpdate(
      { sensor_id: sensorId },
      { $set: { name: sensorName } },
      { new: true },
    );

    console.log("UPDATED: ", modifiedSensor);

    if (!modifiedSensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    await retryUntilAck(10, updateSensor, {
      sensor_id: sensorId,
      sensor_name: sensorName,
    });

    return modifiedSensor;
  } catch (err) {
    console.error("Error updating sensor:", err);
    throw err;
  }
};

const getSensorData = async (query) => {
  return await Sensor.find(query);
};

function generateIPAddresses(i) {
  return [
    Math.floor(i / 256 ** 3) % 256,
    Math.floor(i / 256 ** 2) % 256,
    Math.floor(i / 256) % 256,
    i % 256,
  ].join(".");
}

const isNameTaken = async (name, sensorId) => {
  return await Sensor.exists({
    name,
    sensor_id: { $ne: sensorId },
  });
};

module.exports = {
  addSensorData,
  deleteSensorData,
  getSensorData,
  modifySensorData,
  countSensors,
  generateIPAddresses,
  connectWithRetry,
};
