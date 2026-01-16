import { createStore } from "vuex";
import sensors from "./modules/sensors";
import measurements from "./modules/measurements";
import stats from "./modules/statistics";
import data from "./modules/data";
import table from "./modules/table";
import user from "./modules/user";
import socket from "./modules/socket";

export const store = createStore({
  state: {
    maxMessages: 50,
    minMeasurements: 50,
    maxMeasurements: 1000,
    currentMeasurements: 250,
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
    setCurrentMeasurements(state, value) {
      state.currentMeasurements = value;
    },
    setCenter(state, { currentLng, currentLat }) {
      state.center.lng = currentLng;
      state.center.lat = currentLat;
    },
    setInitialized(state, value) {
      state.initialized = value;
    },
  },
  actions: {
    async initializeAll({ dispatch, commit, getters }) {
      console.log("Waiting for backend readiness...");

      while (
        !store.getters["socket/isSocketConnected"] ||
        !store.getters["socket/isServerReady"]
      ) {
        await new Promise((r) => setTimeout(r, 100));
      }

      console.log("Backend ready — initializing app");
      await dispatch("data/initializeData");
      await dispatch("table/initializeTableData");
      await dispatch("sensors/initializeSensors");
      await dispatch("stats/initializeStats");

      commit("setInitialized", true);
    },
  },

  modules: {
    sensors,
    measurements,
    stats,
    data,
    table,
    user,
    socket,
  },
});
