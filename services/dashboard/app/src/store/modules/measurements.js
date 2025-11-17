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
  lastMeasurement: (state) => {
    return state.measurements[state.measurements.length - 1];
  },
};

//MUTATIONS
const mutations = {
  setMeasurement(state, { sensor_id, name, timestamp, data, maxMeasurements }) {
    state.measurements.unshift({
      sensor_id: sensor_id,
      name: name,
      timestamp: timestamp,
      data: data,
    });

    if (state.measurements.length > maxMeasurements) {
      state.measurements = state.measurements.slice(0, maxMeasurements);
    }
  },
};

//ACTIONS
const actions = {
  updateMeasurements({ commit, rootState }, { sensor_id, name, data }) {
    const { timestamp, ...dataWithoutTimestamp } = data;
    commit("setMeasurement", {
      sensor_id: sensor_id,
      name: name,
      timestamp: data.timestamp,
      data: dataWithoutTimestamp,
      maxMeasurements: rootState.maxMeasurements,
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
