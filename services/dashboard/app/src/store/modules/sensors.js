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
  columns: [
    { key: "sensor_id", label: "Id", visible: false }, //da aggiungere come proprietà al componente
    { key: "name", label: "Name", center: true, sortable: true },
    { key: "lat", label: "Latitude", center: true, sortable: true },
    { key: "lng", label: "Longitude", center: true, sortable: true },
    { key: "status", label: "Status", center: true, sortable: true },
    {
      key: "distanceFromCenter",
      label: "Distance from center (m)",
      center: true,
      sortable: true,
    },
    {
      key: "lastMeasurementReceived",
      label: "Last measurement received",
      center: true,
      sortable: true,
    },
    {
      key: "timeSinceLastMeasurement",
      label: "Time since last measurement",
      center: true,
      sortable: true,
    },
  ],
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
  setSensorsData(state, { sensorsData, measurementsTypes }) {
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
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

//ACTIONS
const actions = {
  async fetchSensors({ commit, state, rootGetters }) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const sensorsData = await fetchFromApi(`${apiUrl}/api/sensors`);
      const measurementsTypes = rootGetters["data/getMeasurementsTypes"];
      commit("setSensorsData", { sensorsData, measurementsTypes });
      console.log(`Loaded ${state.sensors.size} sensors from API`);
      return state.sensors;
    } catch (error) {
      console.error("Unable to fetch sensors from API:", error);
    }
  },
  async addSensor({ commit }, data) {
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
      refreshSensors();
    } catch (error) {
      console.error("Unable to send sensor to API:", error);
    }
  },
  refreshSensors({ commit, dispatch }) {
    commit("resetSensors");
    dispatch("fetchSensors");
  },
  updateLastMeasurement({ commit, getters }, id) {
    commit("updateSensor", id);
    console.log("Dw, sono un sensore");
    console.log(getters.getSensor(id));
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
