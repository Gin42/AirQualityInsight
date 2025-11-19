import measurements from "./measurements";

const state = {
  stats: new Map(),
  eaqi: {},
};

const getters = {
  getStats: (state) => {
    return Array.from(state.stats.values());
  },
  getEaqi: (state) => state.eaqi,
};

const mutations = {};

const actions = {
  clearStats({ dispatch }) {
    dispatch("initializeStats");
    dispatch("updateEAQI");
  },

  update({ dispatch }, { measurementData }) {
    dispatch("updateStats", { measurementData });
    dispatch("updateEAQI");
  },

  initializeStats({ state, rootGetters }) {
    const measurements = rootGetters["data/getMeasurementsTypes"];
    for (const measurementType in measurements) {
      const name = capitalizeFirstLetter(measurementType);
      state.stats.set(measurementType, {
        measurement: name,
        intensity: null,
        mean: "N/A",
        median: "N/A",
        min: "N/A",
        max: "N/A",
        range: "N/A",
        quality: "N/A",
      });
    }
  },

  async updateStats({ state, rootGetters, dispatch }, { measurementData }) {
    for (const measurementType in measurementData) {
      const measurementArray =
        rootGetters["measurements/getAllOfType"](measurementType);
      const statistics = calculateStats(measurementArray);
      const intensity = await dispatch("getIntensity", {
        concentration: statistics.mean,
        pollutant: measurementType,
      });
      state.stats.set(measurementType, {
        ...state.stats.get(measurementType),
        intensity: intensity,
        mean: parseFloat(statistics.mean).toFixed(2),
        median: parseFloat(statistics.median).toFixed(2),
        min: parseFloat(statistics.min).toFixed(2),
        max: parseFloat(statistics.max).toFixed(2),
        range: parseFloat(statistics.range).toFixed(2),
        quality: getIntensityLabel(intensity),
      });
    }
  },

  updateEAQI({ state }) {
    state.eaqi = calculateEAQI([
      state.stats.get("pm25"),
      state.stats.get("pm10"),
      state.stats.get("no2"),
      state.stats.get("o3"),
      state.stats.get("so2"),
    ]);
  },

  async getIntensity({ rootGetters }, { concentration, pollutant }) {
    const measurements = rootGetters["data/getMeasurementsTypes"];
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

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function calculateEAQI(pollutants) {
  let dominantPollutant = null;

  for (const pollutant of pollutants) {
    if (dominantPollutant === null) {
      dominantPollutant = pollutant;
    } else if (
      pollutant.intensity !== null &&
      dominantPollutant.intensity.value < pollutant.intensity.value
    ) {
      dominantPollutant = pollutant;
    }
  }

  return dominantPollutant;
}

function calculateStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b) / values.length;

  return {
    mean,
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
