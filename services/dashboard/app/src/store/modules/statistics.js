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
    let types = getters.allMeasurementsTypes;
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

const actions = {
  getIntensity({ rootGetters }, { concentration, pollutant }) {
    let measurements = rootGetters["data/getMeasurementsTypes"];
    const threshold = measurements[pollutant].thresholds;
    if (!threshold) throw new Error(`Unknown pollutant: ${pollutant}`);

    const thresholds = rootGetters["data/getThresholds"];

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

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
