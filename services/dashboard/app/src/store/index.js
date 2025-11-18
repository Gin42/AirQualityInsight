import { createStore } from "vuex";
import sensors from "./modules/sensors";
import measurements from "./modules/measurements";
import stats from "./modules/statistics";
import eaqi from "./modules/eaqi";
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
  },
  getters: {
    isInitialized: (state) => {
      return state.initialized;
    },
  },
  mutations: {
    setCenter(state, { currentLng, currentLat }) {
      state.center.lng = currentLng;
      state.center.lat = currentLat;
    },
  },
  actions: {
    async initializeAll({ state, dispatch }) {
      dispatch("data/initializeData");
      dispatch("table/initializeTableData");
      dispatch("sensors/initializeSensors");
      dispatch("stats/initializeStats");
      state.initialized = true;
    },
  },
  modules: {
    sensors,
    measurements,
    stats,
    eaqi,
    data,
    table,
  },
});
