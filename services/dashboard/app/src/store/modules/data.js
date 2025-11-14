import jsonData from "../../assets/data/setupData.json";

const state = () => ({
  thresholds: [],
  measurementsTypes: [],
});

const getters = {
  getThresholds: (state) => state.thresholds,
  getMeasurementsTypes: (state) => state.measurementsTypes,
};

const mutations = {
  setThresholds(state, thresholds) {
    state.thresholds = thresholds;
  },
  setMeasurements(state, measurementsTypes) {
    state.measurementsTypes = measurementsTypes;
  },
};

const actions = {
  initializeData({ commit, getters }) {
    commit("setThresholds", jsonData.thresholds);

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
