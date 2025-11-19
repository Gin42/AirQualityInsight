/**
 * measurement shape: {
 *     sensor_id: null,
 *     timestamp: null
 *     data: null
 *    },
 **/
const state = () => ({
  measurements: [],
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
      parseFloat(measurement[measurementType])
    );
  },
};

//MUTATIONS
const mutations = {
  setMeasurement(state, { formattedData, maxMeasurements }) {
    const measurement = {
      ...formattedData,
      ...formattedData.data,
    };

    delete measurement.data;
    state.measurements.unshift(measurement);

    if (state.measurements.length > maxMeasurements) {
      state.measurements = state.measurements.slice(0, maxMeasurements);
    }
  },
};

//ACTIONS
const actions = {
  updateMeasurements({ commit, rootState }, { formattedData }) {
    commit("setMeasurement", {
      formattedData,
      maxMeasurements: rootState.currentMeasurements,
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
