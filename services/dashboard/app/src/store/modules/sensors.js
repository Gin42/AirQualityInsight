//sensor shape: [{....}]
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
    Array.from(state.sensors.values());
  },
  allSensorsCount: (state) => {
    return state.sensors.values().lenght();
  },
  allActiveSensors: (state) => {
    return state.sensors.filter((sensor) => sensor.active);
  },
  getSensor: (state, id) => {
    return state.sensors.filter((sensor) => sensor.id === id);
  },
};

//MUTATIONS
const mutations = {
  setSensorData(state, sensors) {
    const sensorMap = new Map(
      sensors.map((sensor) => [
        sensor.sensor_id,
        {
          id: sensor.sensor_id,
          name: sensor.name,
          lat: sensor.location.coordinates[1], // latitude
          lng: sensor.location.coordinates[0], // longitude
          //desc: sensor.sensor_id,
          active: sensor.active,
          //status: sensor.active ? "Active" : "Inactive",
          ip: sensor.ip,
          last_seen: sensor.last_seen,
          measurements: Object.fromEntries(
            Object.keys(this.measurements).map((type) => [
              type,
              { stats: null, data: [] },
            ])
          ),
        },
      ])
    );
    state.sensor = sensorMap;
  },
  resetSensors(state) {
    state.sensors = new Map();
  },
  updateLastMeasurement(state, getters, id) {
    if (!state.sensors.data?.size) return;

    const sensor = getters.getSensor(id);
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
  async fetchSensors({ commit }) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const sensorsData = await fetchFromApi(`${apiUrl}/api/sensors`);
      commit("setSensorsData", sensorsData);

      //this.$emit("sensors-loaded", sensors);
      console.log(`Loaded ${sensorsData.size} sensors from API`);
    } catch (error) {
      console.error("Unable to fetch sensors from API:", error);
    }
  },
  async addSensor(data) {
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
  refreshSensors() {
    commit("resetSensors");
    dispatch("fetchSensors");
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
