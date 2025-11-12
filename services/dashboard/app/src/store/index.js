import Vue from "vue";
import Vuex from "vuex";
import sensors from "./modules/sensors";
import measurements from "./modules/measurements";
import stats from "./modules/statistics";
import eaqi from "./modules/eaqi";
import data from "./modules/data";
import table from "./modules/table";

Vue.useAttrs(Vuex);

export default new Vuex.Store({
  state: {
    maxMessages: 50,
    minMeasurements: 50,
    maxMeasurements: 1000,
    center: {
      lng: "11.3426000",
      lat: "44.4939000",
      name: "Piazza Maggiore",
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
