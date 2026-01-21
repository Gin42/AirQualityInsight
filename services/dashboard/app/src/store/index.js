import { createStore } from "vuex";
import sensors from "./modules/sensors";
import measurements from "./modules/measurements";
import stats from "./modules/statistics";
import data from "./modules/data";
import table from "./modules/table";
import user from "./modules/user";
import socket from "./modules/socket";
import map from "./modules/map";

export const store = createStore({
  state: {
    maxMessages: 50,
    initialized: false,
  },
  getters: {
    isInitialized: (state) => {
      return state.initialized;
    },
  },
  mutations: {
    setInitialized(state, value) {
      state.initialized = value;
    },
  },
  actions: {
    async initializeAll({ dispatch, commit, getters }) {
      await dispatch("data/initializeData");
      await dispatch("table/initializeTableData");
      console.log("Waiting for backend readiness...");

      while (
        !store.getters["socket/isSocketConnected"] ||
        !store.getters["socket/isServerReady"]
      ) {
        await new Promise((r) => setTimeout(r, 100));
      }

      console.log("Backend ready — initializing app");

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
    map,
  },
});
