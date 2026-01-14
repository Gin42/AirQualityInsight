const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  sensor_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  ip: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  last_seen: {
    type: Date,
    default: Date.now,
  },
});
sensorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Sensor", sensorSchema);
