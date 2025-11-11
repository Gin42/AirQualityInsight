import { io } from "socket.io-client";
import store from "../store/index";

const serverUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
const socket = io(serverUrl);

socket.on("kafka-message", (message) => {
  /*this.addInfo("Received new measurement");*/

  message.timestamp = this.formatTimestamp(message.timestamp || new Date());
  //this.$refs.mapComponent?.registerNewMeasurement(message);

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

  store.dispatch("measurements/updateMeasurement", formattedData);

  store.dispatch("statistics/updateStats");

  store.dispatch("eaqi/updateEAQI");
});
