const state = {
  columns: [
    { key: "measurement", label: "Measurement" },
    { key: "mean", label: "Mean", center: true },
    { key: "median", label: "Median", center: true },
    { key: "min", label: "Min", center: true },
    { key: "max", label: "Max", center: true },
    { key: "range", label: "Range", center: true },
    { key: "quality", label: "Quality", center: true, html: true },
  ],
  data: {},
};
const getters = {};
const mutations = {
  updateStats(state) {
    let data = store.allMeasurements(state);
    for (const measurementType of Object.keys(data)) {
      let measurement = data[measurementType].data;
      measurement.unshift(message[measurementType]);
      if (measurement.length > this.maxMessages)
        measurement = measurement.slice(0, this.maxMessages);

      const stats = this.calculateStats(measurement);
      const intensity = this.getIntensity(stats.mean, measurementType);
      this.statsMeasurement.data[measurementType].intensity = intensity;
      this.statsMeasurement.data[measurementType].mean = parseFloat(
        stats.mean
      ).toFixed(2);
      this.statsMeasurement.data[measurementType].median = parseFloat(
        stats.median
      ).toFixed(2);
      this.statsMeasurement.data[measurementType].min = parseFloat(
        stats.min
      ).toFixed(2);
      this.statsMeasurement.data[measurementType].max = parseFloat(
        stats.max
      ).toFixed(2);
      this.statsMeasurement.data[measurementType].range = parseFloat(
        stats.range
      ).toFixed(2);
      this.statsMeasurement.data[measurementType].quality =
        this.getIntensityLabel(intensity);
    }
  },
};

function calculateStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b) / values.length;

  return {
    mean: mean.toFixed(2),
    median: sorted[Math.floor(sorted.length / 2)],
    min: Math.min(...values),
    max: Math.max(...values),
    range: Math.max(...values) - Math.min(...values),
  };
}
const actions = {};
