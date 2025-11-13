import jsonData from "../../assets/data/setupData.json";

const state = () => ({
  threshold: {},
  measurementsTypes: [],
});

const getters = {
  getThreshold: (state) => state.threshold,
  getMeasurementsTypes: (state) => state.measurementsTypes,
};

const mutations = {
  setThreshold(state, threshold) {
    state.threshold = threshold;
  },
  setMeasurements(state, measurementsTypes) {
    state.measurementsTypes = measurementsTypes;
  },
};

const actions = {
  initializeData({ commit }) {
    commit("setThreshold", jsonData.threshold);
    commit("setMeasurements", jsonData.measurementsTypes);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
