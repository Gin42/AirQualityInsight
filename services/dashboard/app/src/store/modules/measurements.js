/**
 * measurement shape: {
 *     sensor_id: null,
 *     timestamp: null
 *     data: null
 *    },
 **/
const state = () => ({
  measurements: [],
  minMeasurements: 50,
  maxMeasurements: 1000,
  currentMeasurements: 250,
});

//GETTERS
const getters = {
  allMeasurements: (state) => {
    return state.measurements;
  },
  allMeasurementsCount: (state) => {
    return state.measurements.length;
  },
  lastMeasurement: (state) => {
    return state.measurements[state.measurements.length - 1];
  },
  getAllOfType: (state) => (measurementType) => {
    return state.measurements.map((measurement) =>
      parseFloat(measurement[measurementType]),
    );
  },
};

//MUTATIONS
const mutations = {
  setMeasurement(state, { formattedData }) {
    const measurement = {
      ...formattedData,
      ...formattedData.data,
    };

    delete measurement.data;
    state.measurements.unshift(measurement);

    if (state.measurements.length > state.maxMeasurements) {
      state.measurements = state.measurements.slice(0, state.maxMeasurements);
    }
  },
  setCurrentMeasurements(state, value) {
    state.currentMeasurements = value;
  },
};

//ACTIONS
const actions = {
  updateMeasurements({ commit }, { formattedData }) {
    commit("setMeasurement", {
      formattedData,
    });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
