//measurement shape: [{....}]
const state = () => ({
  measurements: [],
  columns: [
    { key: "sensor_id", label: "Id" },
    { key: "name", label: "Name" },
    { key: "timestamp", label: "Timestamp", center: true },
  ],
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
  addMeasurement(state, data, rootState) {
    state.measurements.unshift(data);
    if (state.measurements.length > rootState.maxMessages) {
      state.measurements = state.measurements.slice(0, rootState.maxMessages);
    }
  },
  setMeasurement(state, newMeasurement) {
    state.measurements.push(newMeasurement);
  },
};

//ACTIONS
const actions = {
  updateMeasurements({ commit }, data) {
    commit("setMeasurement", data);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
