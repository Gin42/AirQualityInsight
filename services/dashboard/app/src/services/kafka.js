import { io } from "socket.io-client";
import { store } from "../store";

const serverUrl = import.meta.env.VITE_SOCKET_SERVER_URL;

export const socket = io(serverUrl, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("Connected to server");
  store.commit("socket/setConnected", true);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
  store.commit("socket/setConnected", false);
  store.commit("socket/setServerReady", false);
});

socket.on("server:ready", () => {
  console.log("Server fully ready");
  store.commit("socket/setServerReady", true);
});

socket.on("server:not-ready", () => {
  console.log("Server not ready yet");
  store.commit("socket/setServerReady", false);
});

socket.on("kafka-message", (message) => {
  if (
    store.getters["socket/isSocketConnected"] &&
    store.getters["socket/isServerReady"]
  ) {
    message.timestamp = formatTimestamp(message.timestamp || new Date());

    const formattedData = {
      timestamp: message.timestamp,
      sensor_id: message.sensor_id,
      name: message.name,
      data: {
        temperature: parseFloat(message.temperature).toFixed(2),
        humidity: parseFloat(message.humidity).toFixed(2),
        pressure: parseFloat(message.pressure).toFixed(2),
        voc: parseFloat(message.voc).toFixed(2),
        co2: parseFloat(message.co2).toFixed(2),
        pm25: parseFloat(message.pm25).toFixed(2),
        pm10: parseFloat(message.pm10).toFixed(2),
        no2: parseFloat(message.no2).toFixed(2),
        o3: parseFloat(message.o3).toFixed(2),
        so2: parseFloat(message.so2).toFixed(2),
      },
    };

    console.log("new measurement");

    store.dispatch("sensors/updateLastMeasurement", {
      formattedData,
    });

    store.dispatch("measurements/updateMeasurements", {
      formattedData,
    });

    store.dispatch("stats/update", {
      measurementData: formattedData.data,
    });
  }
});

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
