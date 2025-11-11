import Vue from "vue";
import Vuex from "vuex";
import sensors from "./modules/sensors";
import measurements from "./modules/measurements";

Vue.useAttrs(Vuex);

export default new Vuex.Store({
  state: {
    minMeasurements: 50,
    maxMeasurements: 1000,
  },
  modules: {
    sensors,
    measurements,
  },
});
