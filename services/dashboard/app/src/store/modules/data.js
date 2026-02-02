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
    Object.values(measurementsTypes).forEach((type) => {
      type.heatLatLng = new Map();
    });
    state.measurementsTypes = measurementsTypes;
  },
};

const actions = {
  initializeData({ commit }) {
    console.log("INIZIALIZZIAMO STI DATI");
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
