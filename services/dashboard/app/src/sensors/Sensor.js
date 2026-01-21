// src/sensors/Sensor.js
export default class Sensor {
  constructor(data, center) {
    this.sensor_id = data.sensor_id;
    this.name = data.name;
    this.lat = data.location.coordinates[1];
    this.lng = data.location.coordinates[0];
    this.active = data.active; //true or false
    this.ip = data.ip;
    this.last_seen = data.last_seen;
    this.measurements = new Map();
    this.distance_center = this._calculateDistance(
      center.lat,
      center.lng,
      this.lat,
      this.lng,
    ).toFixed(2);
    this.lastMeasurementReceived = "N/A";
    this.lastMeasurementReceivedRaw = null;
    this.timeSinceLastMeasurement = "N/A";
    this.marker = null;
  }

  getName() {
    return this.name;
  }

  getLat() {
    return this.lat;
  }

  getLng() {
    return this.lng;
  }

  getActive() {
    return this.active;
  }

  getId() {
    return this.sensor_id;
  }

  getDistanceFromCenter() {
    return this.distance_center;
  }

  getLastMeasurementReceived() {
    return this.lastMeasurementReceived;
  }

  getLastMeasurementReceivedRaw() {
    return this.lastMeasurementReceivedRaw;
  }

  getTimeSinceMeasurement() {
    return this.timeSinceLastMeasurement;
  }

  getMarker() {
    return this.marker;
  }

  setMeasurements(timestamp, data, maxMeasurements) {
    this.measurements.set(timestamp, { data });

    if (this.measurements.size > maxMeasurements) {
      const oldestKey = [...this.measurements.keys()].pop();
      this.measurements.delete(oldestKey);
    }

    const now = new Date();
    this.setLastMeasurementReceived(now);
    this.setLastMeasurementReceivedRaw(now);
    this.setTimeSinceLastMeasurement("Just now");
  }

  setLastMeasurementReceived(newValue) {
    this.lastMeasurementReceived = this._formatTimestamp(newValue);
  }

  setLastMeasurementReceivedRaw(newValue) {
    this.lastMeasurementReceivedRaw = newValue;
  }

  setTimeSinceLastMeasurement(newValue) {
    this.timeSinceLastMeasurement = newValue;
  }

  setMarker(marker) {
    this.marker = marker;
  }

  _formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  /**
   * Function to calculate the distance between two geographic points (Haversine formula)
   * @see https://en.wikipedia.org/wiki/Haversine_formula
   */
  _calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
