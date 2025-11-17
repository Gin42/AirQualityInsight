import { io } from "socket.io-client";
import { store } from "../store";

const serverUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
const socket = io(serverUrl);

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

socket.on("kafka-message", (message) => {
  /*this.addInfo("Received new measurement");*/

  message.timestamp = formatTimestamp(message.timestamp || new Date());

  const formattedData = {
    sensor_id: message.sensor_id,
    name: message.name,
    timestamp: message.timestamp,
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
  };

  console.log("new measurement");

  store.dispatch("measurements/updateMeasurements", formattedData);

  store.dispatch("sensors/updateLastMeasurement", formattedData.sensor_id);
  /*
  store.dispatch("statistics/updateStats", message);

  store.dispatch("eaqi/updateEAQI");*/
});
