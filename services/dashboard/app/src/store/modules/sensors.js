/*sensor shape: [{
sensor_id,
name,
position: [lat, lng]
status,
ip
}]*/
import { fetchFromApi } from "@/services/api";

const state = () => ({
  sensors: new Map(),
  newSensor: false,
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
    return Array.from(state.sensors.values()).filter((sensor) => sensor.active);
  },
  getSensor: (state) => (id) => {
    return Array.from(state.sensors.values()).find(
      (sensor) => sensor.id === id
    );
  },
};

//MUTATIONS
const mutations = {
  setSensorsData(state, { sensorsData, measurementsTypes, center }) {
    const sensorMap = new Map(
      sensorsData.map((sensor) => [
        sensor.sensor_id,
        {
          id: sensor.sensor_id,
          name: sensor.name,
          lat: sensor.location.coordinates[1], // latitude
          lng: sensor.location.coordinates[0], // longitude
          desc: sensor.sensor_id,
          active: sensor.active,
          status: sensor.active ? "Active" : "Inactive",
          ip: sensor.ip,
          last_seen: sensor.last_seen,
          measurements: Object.fromEntries(
            Object.keys(measurementsTypes).map((type) => [
              type,
              { stats: null, data: [] },
            ])
          ),
          distanceFromCenter: calculateDistance(
            center.lat,
            center.lng,
            sensor.location.coordinates[1],
            sensor.location.coordinates[0]
          ).toFixed(2),
          lastMeasurementReceived: "N/A",
          lastMeasurementReceivedRaw: null,
          timeSinceLastMeasurement: "N/A",
        },
      ])
    );
    state.sensors = sensorMap;
  },
  resetSensors(state) {
    state.sensors = new Map();
  },
  updateSensor(state, id) {
    const sensor = state.sensors.get(id);
    if (!sensor) return;

    const now = new Date();
    sensor.lastMeasurementReceived = formatTimestamp(now);
    sensor.lastMeasurementReceivedRaw = now;
    sensor.timeSinceLastMeasurement = "Just now";
  },
  setNewSensor(state, value) {
    state.newSensor = value;
  },
};

//ACTIONS
const actions = {
  async fetchSensors({ commit, state, rootGetters, rootState, getters }) {
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
      return state.sensors;
    } catch (error) {
      console.error("Unable to fetch sensors from API:", error);
    }
  },
  async addSensor({ dispatch, commit }, data) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
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
      dispatch("refreshSensors");
      commit("setNewSensor", true);
    } catch (error) {
      console.error("Unable to send sensor to API:", error);
    }
  },
  refreshSensors({ commit, dispatch }) {
    commit("resetSensors");
    dispatch("fetchSensors");
  },
  updateLastMeasurement({ commit }, id) {
    commit("updateSensor", id);
  },
  updateTimeSinceLastMeasurements({ state, getters }) {
    if (getters.allSensorsCount === 0) {
      return;
    }
    for (const sensor of state.sensors.values())
      sensor.timeSinceLastMeasurement = calculateTimeSince(
        sensor.lastMeasurementReceivedRaw
      );
  },
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

/**
 * Function to calculate the distance between two geographic points (Haversine formula)
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
