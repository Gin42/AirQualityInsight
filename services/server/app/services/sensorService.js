// sensorService.js
const Sensor = require("../models/sensorModel");

const countSensors = () => {
  return Sensor.countDocuments();
};

const addSensorData = async (sensorData) => {
  try {
    sensorData.sensor_id = new mongoose.Types.ObjectId();
    const sensor = await new Sensor(sensorData);
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
};
