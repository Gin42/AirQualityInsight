import { createStore } from "vuex";
import sensors from "./modules/sensors";
import measurements from "./modules/measurements";
import stats from "./modules/statistics";
import data from "./modules/data";
import table from "./modules/table";

export const store = createStore({
  state: {
    maxMessages: 50,
    minMeasurements: 50,
    maxMeasurements: 1000,
    center: {
      lng: "11.3426000",
      lat: "44.4939000",
      name: "Piazza Maggiore",
    },
    initialized: false,
    socketActive: false,
  },
  getters: {
    isInitialized: (state) => {
      return state.initialized;
    },
    isSocketActive: (state) => {
      return state.socketActive;
    },
  },
  mutations: {
    setSocketActive(state, { value }) {
      state.socketActive = value;
    },
    setCenter(state, { currentLng, currentLat }) {
      state.center.lng = currentLng;
      state.center.lat = currentLat;
    },
  },
  actions: {
    async initializeAll({ state, dispatch, commit }) {
      dispatch("data/initializeData");
      dispatch("table/initializeTableData");
      dispatch("sensors/initializeSensors");
      dispatch("stats/initializeStats");
      commit("setSocketActive", { value: true });
      state.initialized = true;
    },
  },
  modules: {
    sensors,
    measurements,
    stats,
    data,
    table,
  },
});
