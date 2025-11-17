//measurement shape: [{....}]
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
