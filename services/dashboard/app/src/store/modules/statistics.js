import { mapGetters } from "vuex";

const state = {
  data: {},
};

const getters = {
  allMeasurementsTypes: (state, getters, rootState) => {
    return rootState.data.getMeasurementsTypes;
  },
};

const mutations = {
  updateStats(state, { message, rootState }) {
    let types = state.allMeasurementsTypes;
    for (const measurementType of Object.keys(types)) {
      let measurement = types[measurementType].data;
      measurement.unshift(message[measurementType]);
      if (measurement.length > rootState.maxMessages) {
        measurement = measurement.slice(0, rootState.maxMessages);
      }
      const stats = calculateStats(measurement);
      const intensity = getIntensity(stats.mean, measurementType);
      state.data[measurementType] = {
        intensity,
        mean: parseFloat(stats.mean).toFixed(2),
        median: parseFloat(stats.median).toFixed(2),
        min: parseFloat(stats.min).toFixed(2),
        max: parseFloat(stats.max).toFixed(2),
        range: parseFloat(stats.range).toFixed(2),
        quality: getIntensityLabel(intensity),
      };
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

function getIntensityLabel(intensity) {
  return `
        <div class="intensity-label">
          <i class="threshold-intensity" style="background-color: ${intensity.color}"></i>
          <span>${intensity.label}</span>
        </div>
      `;
}

const actions = {
  getIntensity(state, { concentration, pollutant }) {
    let measurements = state.allMeasurementsTypes;
    const threshold = measurements[pollutant].thresholds;
    if (!threshold) throw new Error(`Unknown pollutant: ${pollutant}`);

    if (Array.isArray(threshold.good)) {
      const [minGood, maxGood] = threshold.good;
      const [minFair, maxFair] = threshold.fair;
      const [minModerate, maxModerate] = threshold.moderate;
      const [minPoor, maxPoor] = threshold.poor;
      const [minVeryPoor, maxVeryPoor] = threshold.poor;

      if (minGood <= concentration && maxGood >= concentration)
        return this.thresholds.good;
      if (minFair <= concentration && maxFair >= concentration)
        return this.thresholds.fair;
      if (minModerate <= concentration && maxModerate >= concentration)
        return this.thresholds.moderate;
      if (minPoor <= concentration && maxPoor >= concentration)
        return this.thresholds.poor;
      if (minVeryPoor <= concentration && maxVeryPoor >= concentration)
        return this.thresholds.very_poor;
      return this.thresholds.extremely_poor;
    }

    if (concentration <= threshold.good) return this.thresholds.good;
    if (concentration <= threshold.fair) return this.thresholds.fair;
    if (concentration <= threshold.moderate) return this.thresholds.moderate;
    if (concentration <= threshold.poor) return this.thresholds.poor;
    if (concentration <= threshold.very_poor) return this.thresholds.very_poor;
    return this.thresholds.extremely_poor;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
