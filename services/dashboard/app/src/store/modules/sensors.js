/*sensor shape: [{
sensor_id,
name,
position: [lat, lng]
status,
ip
}]*/
import Sensor from "@/sensors/Sensor";
import { fetchFromApi } from "@/services/api";

const state = () => ({
  sensors: new Map(),
  newSensor: {
    incoming: false,
    data: null,
  },
  timeUpdateInterval: null,
});

//GETTERS
const getters = {
  allSensors: (state) => {
    return Array.from(state.sensors.values()); //??? can it return a map?
  },
  allSensorsCount: (state) => {
    return state.sensors.size;
  },
  allActiveSensors: (state) => {
    return Array.from(state.sensors.values()).filter((sensor) =>
      sensor.getActive()
    );
  },
  getSensor: (state) => (id) => {
    return Array.from(state.sensors.values()).find(
      (sensor) => sensor.getId() === id
    );
  },
};

//MUTATIONS
const mutations = {
  setSensorsData(state, { sensorsData, measurementsTypes, center }) {
    const sensorMap = new Map(
      sensorsData.map((sensor) => [
        sensor.sensor_id,
        new Sensor(sensor, measurementsTypes, center),
      ])
    );
    state.sensors = sensorMap;
  },

  addNewSensor(state, { sensorData, measurementsTypes, center }) {
    const sensor = new Sensor(sensorData, measurementsTypes, center);
    state.sensors.set(sensorData.sensor_id, sensor);
    state.newSensor = {
      incoming: true,
      data: sensor,
    };
  },

  resetSensors(state) {
    state.sensors = null;
  },

  updateSensor(state, { id, timestamp, data, maxMeasurements }) {
    const sensor = state.sensors.get(id);

    if (!(sensor instanceof Sensor)) {
      return;
    }

    sensor.setMeasurements(timestamp, data, maxMeasurements);
  },

  setNewSensor(state, value) {
    state.newSensor.incoming = value;
  },
};

//ACTIONS
const actions = {
  async initializeSensors({ state, dispatch }) {
    dispatch("fetchSensors");
    state.timeUpdateInterval = setInterval(() => {
      dispatch("updateTimeSinceLastMeasurements");
    }, 1000);
    return;
  },

  async fetchSensors({ commit, rootGetters, rootState, getters }) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const sensorsData = await fetchFromApi(`${apiUrl}/api/sensors`);
      const measurementsTypes = rootGetters["data/getMeasurementsTypes"];
      commit("setSensorsData", {
        sensorsData,
        measurementsTypes,
        center: rootState.center,
      });
      console.log(`Loaded ${getters.allSensorsCount} sensors from API`);
      return getters.allSensors;
    } catch (error) {
      console.error("Unable to fetch sensors from API:", error);
    }
  },

  async addSensor({ commit }, data) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const measurementsTypes = rootGetters["data/getMeasurementsTypes"];
      const jsonResponse = await fetch(`${apiUrl}/api/createSensor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          location: {
            type: "Point",
            coordinates: [data.longitude, data.latitude],
          },
          active: data.active,
          last_seen: new Date(),
        }),
      });
      const response = await jsonResponse.json();
      if (!response) throw new Error(response || "API request failed");
      commit("addNewSensor", {
        response,
        measurementsTypes,
        center: rootState.center,
      });
    } catch (error) {
      console.error("Unable to send sensor to API:", error);
    }
  },

  refreshSensors({ commit, dispatch }) {
    commit("resetSensors");
    dispatch("fetchSensors");
  },

  updateLastMeasurement({ commit, rootState, rootGetters }, { formattedData }) {
    const measurementsData = rootGetters["data/getMeasurementsTypes"];
    commit("updateSensor", {
      id: formattedData.sensor_id,
      timestamp: formattedData.timestamp,
      data: formattedData.data,
      maxMeasurements: rootState.maxMeasurements,
    });
  },

  updateTimeSinceLastMeasurements({ getters }) {
    if (getters.allSensorsCount === 0) {
      return;
    }
    for (const sensor of getters.allSensors) {
      const time = calculateTimeSince(sensor.getLastMeasurementReceivedRaw());
      sensor.setTimeSinceLastMeasurement(time);
    }
  },
};

function calculateTimeSince(timestamp) {
  if (!timestamp || timestamp === "N/A") return "N/A";

  const now = new Date();
  const lastMeasurement = new Date(timestamp);
  const diffMs = now - lastMeasurement;

  if (diffMs < 0) return "N/A";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMinutes > 0)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffSeconds > 0)
    return `${diffSeconds} second${diffSeconds > 1 ? "s" : ""} ago`;
  return "Just now";
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
