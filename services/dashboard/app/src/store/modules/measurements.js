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
  addMeasurement(state, { sensorId, data }) {
    state.measurements[sensorId].data.unshift(data);
    if (state.measurements.length > state.maxMessages) {
      state.measurements = state.measurement.slice(0, state.maxMessages);
    }
  },
};

//ACTIONS
const actions = {
  updateMeasurements({ commit }, measurement) {
    commit("addMeasurements", measurement);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
