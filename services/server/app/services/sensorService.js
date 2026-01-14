// sensorService.js
const Sensor = require("../models/sensorModel");
const server = require("../server");
const mongoose = require("mongoose");

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
    sensorData.sensor_id = new mongoose.Types.ObjectId();
    const sensor = await new Sensor(sensorData);
    console.log("UGO");
    return await sensor.save();
  } catch (err) {
    console.error("Error saving sensor:", err);
    if (err.errInfo && err.errInfo.details) {
      console.error(
        "Validation details:",
        JSON.stringify(err.errInfo.details, null, 2)
      );
    }
    return;
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

module.exports = {
  addSensorData,
  getSensorData,
  countSensors,
  generateIPAddresses,
  connectWithRetry,
};
