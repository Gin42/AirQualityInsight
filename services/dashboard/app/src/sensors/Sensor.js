// src/sensors/Sensor.js
export default class Sensor {
  constructor(data, measurementsTypes, center) {
    this.sensor_id = data.sensor_id;
    this.name = data.name;
    this.lat = data.location.coordinates[1];
    this.lng = data.location.coordinates[0];
    this.active = data.active; //true or false
    this.ip = data.ip;
    this.last_seen = data.last_seen;
    this.measurements = Object.fromEntries(
      Object.keys(measurementsTypes).map((type) => [
        type,
        { stats: null, data: [] },
      ])
    );
    this.distance_center = this._calculateDistance(
      center.lat,
      center.lng,
      this.lat,
      this.lng
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

  getLastMeasurementReceivedRaw() {
    return this.lastMeasurementReceivedRaw;
  }

  getMarker() {
    return this.marker;
  }

  setMeasurements(data, maxMeasurements, measurementsData, thresholds) {
    const timestamp = data.timestamp;
    for (const [key, value] of Object.entries(data)) {
      if (key in this.measurements) {
        this.measurements[key].data.unshift({
          timestamp: timestamp,
          value: parseFloat(value),
        });

        if (this.measurements[key].data.length > maxMeasurements) {
          this.measurements[key].data = this.measurements[key].data.slice(
            0,
            maxMeasurements
          );
        }

        const stats = this._calculateStats(
          this.measurements[key].data.map((d) => d.value)
        );
        const intensity = this._calculateIntensity(
          stats.mean,
          key,
          measurementsData,
          thresholds
        );

        this.measurements[key].stats = {
          intensity,
          mean: parseFloat(stats.mean).toFixed(2),
          median: parseFloat(stats.median).toFixed(2),
          min: parseFloat(stats.min).toFixed(2),
          max: parseFloat(stats.max).toFixed(2),
          range: parseFloat(stats.range).toFixed(2),
          quality: this._getIntensityLabel(intensity),
        };
      }
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

  _calculateStats(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b) / values.length;

    return {
      mean: mean,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...values),
      max: Math.max(...values),
      range: Math.max(...values) - Math.min(...values),
    };
  }

  _calculateIntensity(concentration, pollutant, measurementsData, thresholds) {
    const threshold = measurementsData[pollutant].thresholds;
    if (!threshold) throw new Error(`Unknown pollutant: ${pollutant}`);

    if (Array.isArray(threshold.good)) {
      const [minGood, maxGood] = threshold.good;
      const [minFair, maxFair] = threshold.fair;
      const [minModerate, maxModerate] = threshold.moderate;
      const [minPoor, maxPoor] = threshold.poor;
      const [minVeryPoor, maxVeryPoor] = threshold.very_poor;

      if (minGood <= concentration && maxGood >= concentration)
        return thresholds.good;
      if (minFair <= concentration && maxFair >= concentration)
        return thresholds.fair;
      if (minModerate <= concentration && maxModerate >= concentration)
        return thresholds.moderate;
      if (minPoor <= concentration && maxPoor >= concentration)
        return thresholds.poor;
      if (minVeryPoor <= concentration && maxVeryPoor >= concentration)
        return thresholds.very_poor;
      return thresholds.extremely_poor;
    }

    if (concentration <= threshold.good) return thresholds.good;
    if (concentration <= threshold.fair) return thresholds.fair;
    if (concentration <= threshold.moderate) return thresholds.moderate;
    if (concentration <= threshold.poor) return thresholds.poor;
    if (concentration <= threshold.very_poor) return thresholds.very_poor;
    return thresholds.extremely_poor;
  }

  _getIntensityLabel(intensity) {
    return `
        <div class="intensity-label">
          <i class="threshold-intensity" style="background-color: ${intensity.color}"></i>
          <span>${intensity.label}</span>
        </div>
      `;
  }
}
