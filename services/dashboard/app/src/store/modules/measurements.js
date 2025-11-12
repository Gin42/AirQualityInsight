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
};

//MUTATIONS
const mutations = {
  addMeasurement(state, data, rootState) {
    state.measurements.unshift(data);
    if (state.measurements.length > rootState.maxMessages) {
      state.measurements = state.measurements.slice(0, rootState.maxMessages);
    }
  },
};

//ACTIONS
const actions = {
  updateMeasurements({ commit }, measurement) {
    commit("addMeasurement", measurement);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
