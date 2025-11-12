import jsonData from "../../assets/data/tableData.json";

const state = () => ({
  infoTable: {},
  measurementsTable: [],
  statsTable: [],
  sensorsTable: [],
});

const getters = {
  getInfoTable: (state) => state.infoTable,
  getMeasurementsTable: (state) => state.measurementsTable,
  getStatsTable: (state) => state.statsTable,
  getSensorsTable: (state) => state.sensorsTable,
};

const mutations = {
  setInfoTable(state, infoTable) {
    state.infoTable = infoTable;
  },
  setMeasurementsTable(state, measurementsTable) {
    state.measurementsTable = measurementsTable;
  },
  setStatsTable(state, statsTable) {
    state.statsTable = statsTable;
  },
  setSensorsTable(state, sensorsTable) {
    state.sensorsTable = sensorsTable;
  },
};

const actions = {
  initializeData({ commit }) {
    commit("setInfoTable", jsonData.infoTable);
    commit("setMeasurementsTable", jsonData.measurementsTable);
    commit("setStatsTable", jsonData.statsTable);
    commit("setSensorsTable", jsonData.sensorsTable);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
