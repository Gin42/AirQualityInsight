import Sensor from "@/sensors/Sensor";
import { fetchFromApi } from "@/services/api";
import { reactive } from "vue";

const state = () => ({
  sensors: reactive(new Map()),
});

//GETTERS
const getters = {
  allSensors: (state) => {
    return Array.from(state.sensors.values());
  },
  allSensorsCount: (state) => {
    return state.sensors.size;
  },
  allActiveSensors: (state) => {
    return Array.from(state.sensors.values()).filter((sensor) =>
      sensor.getActive(),
    );
  },
  getSensor: (state) => (id) => state.sensors.get(id),
};

//MUTATIONS
const mutations = {
  setSensorsData(state, { sensorsData, center }) {
    state.sensors.clear();

    for (const sensor of sensorsData) {
      state.sensors.set(sensor.sensor_id, new Sensor(sensor, center));
    }
  },

  addNewSensor(state, { sensorData, center }) {
    const sensor = new Sensor(sensorData, center);
    state.sensors.set(sensorData.sensor_id, sensor);
  },

  deleteSensorData(state, { sensorId }) {
    state.sensors.delete(sensorId);
  },

  modifySensorData(state, { sensorId, sensorName }) {
    let sensor = state.sensors.get(sensorId);
    sensor.name = sensorName;
    state.sensors.set(sensorId, sensor);
  },

  updateStatus(state, { sensorId, active }) {
    let sensor = state.sensors.get(sensorId);
    sensor.active = active;
    state.sensors.set(sensorId, sensor);
  },

  resetSensors(state) {
    state.sensors.clear();
  },

  updateSensor(state, { id, timestamp, data, maxMeasurements }) {
    const sensor = state.sensors.get(id);

    if (!(sensor instanceof Sensor)) {
      return;
    }

    sensor.setMeasurements(timestamp, data, maxMeasurements);
  },

  updateAllStatuses(state, active) {
    for (const [id, sensor] of state.sensors.entries()) {
      sensor.active = active;
      state.sensors.set(id, sensor);
    }
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
      const sensorsData = await fetchFromApi(`${apiUrl}/api/sensor`);
      const measurementsTypes = rootGetters["data/getMeasurementsTypes"];
      if (sensorsData) {
        commit("setSensorsData", {
          sensorsData,
          measurementsTypes,
          center: rootState.map.center,
        });
      }
      return getters.allSensors;
    } catch (error) {
      console.error("Unable to fetch sensors from API:", error);
    }
  },

  async addSensor({ commit, rootState }, data) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;

      const response = await fetchFromApi(`${apiUrl}/api/sensor/addSensor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      if (response) {
        commit("addNewSensor", {
          sensorData: response,
          center: rootState.map.center,
        });
      }
    } catch (error) {
      console.error("Unable to send sensor to API:", error);
    }
  },

  async deleteSensor({ commit }, sensorId) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;

      const response = await fetchFromApi(`${apiUrl}/api/sensor/${sensorId}`, {
        method: "DELETE",
      });

      if (response) {
        commit("deleteSensorData", {
          sensorId,
        });
      }
    } catch (error) {
      console.error("Unable to send sensor to API:", error);
    }
  },

  async modifySensor({ commit }, { sensorId, sensorName }) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;

      const response = await fetchFromApi(`${apiUrl}/api/sensor/${sensorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sensorName }),
      });
      if (response) {
        commit("modifySensorData", {
          sensorId,
          sensorName,
        });
      }
    } catch (error) {
      console.error("Unable to send sensor to API:", error);
    }
  },

  async updateSensorStatus({ commit }, { sensorId, active }) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;

      const response = await fetchFromApi(
        `${apiUrl}/api/sensor/${sensorId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active }),
        },
      );
      if (response) {
        commit("updateStatus", {
          sensorId,
          active,
        });
      }
    } catch (error) {
      console.error("Unable to send sensor to API:", error);
    }
  },

  async updateAllStatus({ commit, dispatch }, selectedStatus) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;

      const response = await fetchFromApi(`${apiUrl}/api/sensor/setAllStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedStatus }),
      });

      if (response) {
        commit("updateAllStatuses", selectedStatus);
      }
    } catch (error) {
      console.error("Unable to send sensor to API:", error);
    }
  },

  refreshSensors({ commit, dispatch }) {
    commit("resetSensors");
    dispatch("fetchSensors");
  },

  updateLastMeasurement({ commit, rootState }, { formattedData }) {
    const maxMeasurements = rootState.measurements.maxMeasurements;
    commit("updateSensor", {
      id: formattedData.sensor_id,
      timestamp: formattedData.timestamp,
      data: formattedData.data,
      maxMeasurements: maxMeasurements,
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
