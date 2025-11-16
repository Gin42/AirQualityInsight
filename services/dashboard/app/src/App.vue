<!-- App.vue -->
<script>
import { mapGetters } from "vuex";
import { mapActions } from "vuex";

export default {
  name: "App",
  methods: {
    ...mapActions("data", ["initializeData"]),
    ...mapActions("table", ["initializeTableData"]),
  },
  created() {
    this.initializeData();
    this.initializeTableData();
  },
  mounted() {},
}; /*
    /*return {
      socket: null,
      map: null,
      activeSensors: false,
      timeUpdateInterval: null,
      eaqi: null,
      isFormVisible: false,
      latitude: null,
      longitude: null,
      address: null,
    };
  },
  created() {
    this.connectSocket();

    const explainThreshold = (threshold, extremely_poor = false) => {
      if (Array.isArray(threshold) && extremely_poor) return threshold;
      if (Array.isArray(threshold))
        return `&ge; ${threshold[0]}, &le; ${threshold[1]}`;
      if (extremely_poor) return `&gt; ${threshold}`;
      return `&le; ${threshold}`;
    };

    for (const [key, data] of Object.entries(this.measurements)) {
      this.infoMeasurement.data.push({
        measurement: data.label,
        measurementUnit: data.info.measurementUnit,
        min: data.info.min,
        max: data.info.max,
        thresholdGood: explainThreshold(data.thresholds.good),
        thresholdFair: explainThreshold(data.thresholds.fair),
        thresholdModerate: explainThreshold(data.thresholds.moderate),
        thresholdPoor: explainThreshold(data.thresholds.poor),
        thresholdVeryPoor: explainThreshold(data.thresholds.very_poor),
        thresholdExtremelyPoor: explainThreshold(
          data.thresholds.extremely_poor,
          true
        ),
        info: this.createInfoIcon(data.info.description),
      });

      this.collectedMeasurement.columns.push({
        key: key,
        label: [
          this.measurements[key].label,
          " ",
          "(" + this.measurements[key].info.measurementUnit + ")",
        ].join("<wbr>"),
        center: true,
        html: true,
      });
    }

    this.clearStats();

    this.timeUpdateInterval = setInterval(() => {
      this.updateTimeSinceLastMeasurements();
    }, 1000);
  },
  beforeDestroy() {
    this.disconnectSocket();

    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
  },
  methods: {
    /*connectSocket() {
      const serverUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      this.socket = io(serverUrl);

      this.socket.on("kafka-message", (message) => {
        //if (!this.activeSensors) return;
        this.addInfo("Received new measurement");

        message.timestamp = this.formatTimestamp(
          message.timestamp || new Date()
        );
        this.$refs.mapComponent?.registerNewMeasurement(message);

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

        this.collectedMeasurement.data.unshift(formattedData);
        if (this.collectedMeasurement.data.length > this.maxMessages)
          this.collectedMeasurement.data = this.collectedMeasurement.data.slice(
            0,
            this.maxMessages
          );

        if (!this.sensors.data?.size) return;

        const sensor = this.sensors.data.get(message.sensor_id);
        if (!sensor) return;

        const now = new Date();
        sensor.lastMeasurementReceived = this.formatTimestamp(now);
        sensor.lastMeasurementReceivedRaw = now;
        sensor.timeSinceLastMeasurement = "Just now";

        for (const measurementType of Object.keys(this.measurements)) {
          let measurement = this.measurements[measurementType].data;
          measurement.unshift(message[measurementType]);
          if (measurement.length > this.maxMessages)
            measurement = measurement.slice(0, this.maxMessages);

          const stats = this.calculateStats(measurement);
          const intensity = this.getIntensity(stats.mean, measurementType);
          this.statsMeasurement.data[measurementType].intensity = intensity;
          this.statsMeasurement.data[measurementType].mean = parseFloat(
            stats.mean
          ).toFixed(2);
          this.statsMeasurement.data[measurementType].median = parseFloat(
            stats.median
          ).toFixed(2);
          this.statsMeasurement.data[measurementType].min = parseFloat(
            stats.min
          ).toFixed(2);
          this.statsMeasurement.data[measurementType].max = parseFloat(
            stats.max
          ).toFixed(2);
          this.statsMeasurement.data[measurementType].range = parseFloat(
            stats.range
          ).toFixed(2);
          this.statsMeasurement.data[measurementType].quality =
            this.getIntensityLabel(intensity);
        }

        this.eaqi = this.calculateEAQI([
          this.statsMeasurement.data.pm25,
          this.statsMeasurement.data.pm10,
          this.statsMeasurement.data.no2,
          this.statsMeasurement.data.o3,
          this.statsMeasurement.data.so2,
        ]);
      });

      this.socket.on("connect", () => {
        this.addInfo("Connected to server");
      });

      this.socket.on("disconnect", () => {
        this.addInfo("Disconnected from server");
      });
    },
    updateTimeSinceLastMeasurements() {
      if (!this.sensors.data?.size) return;

      for (const sensor of this.sensors.data.values())
        sensor.timeSinceLastMeasurement = this.calculateTimeSince(
          sensor.lastMeasurementReceivedRaw
        );
    },
    calculateTimeSince(timestamp) {
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
      if (diffHours > 0)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffMinutes > 0)
        return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
      if (diffSeconds > 0)
        return `${diffSeconds} second${diffSeconds > 1 ? "s" : ""} ago`;
      return "Just now";
    },
    calculateStats(values) {
      const sorted = [...values].sort((a, b) => a - b);
      const mean = values.reduce((a, b) => a + b) / values.length;

      return {
        mean: mean.toFixed(2),
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...values),
        max: Math.max(...values),
        range: Math.max(...values) - Math.min(...values),
      };
    },
    calculateEAQI(pollutants) {
      let dominantPollutant = null;

      for (const pollutant of pollutants) {
        if (null === dominantPollutant) dominantPollutant = pollutant;
        if (dominantPollutant.intensity.value < pollutant.intensity.value)
          dominantPollutant = pollutant;
      }

      return dominantPollutant;
    },
    getIntensity(concentration, pollutant) {
      const threshold = this.measurements[pollutant].thresholds;
      if (!threshold) throw new Error(`Unknown pollutant: ${pollutant}`);

      if (Array.isArray(threshold.good)) {
        const [minGood, maxGood] = threshold.good;
        const [minFair, maxFair] = threshold.fair;
        const [minModerate, maxModerate] = threshold.moderate;
        const [minPoor, maxPoor] = threshold.poor;
        const [minVeryPoor, maxVeryPoor] = threshold.poor;

        if (minGood <= concentration && maxGood >= concentration)
          return this.thresholds.good;
        if (minFair <= concentration && maxFair >= concentration)
          return this.thresholds.fair;
        if (minModerate <= concentration && maxModerate >= concentration)
          return this.thresholds.moderate;
        if (minPoor <= concentration && maxPoor >= concentration)
          return this.thresholds.poor;
        if (minVeryPoor <= concentration && maxVeryPoor >= concentration)
          return this.thresholds.very_poor;
        return this.thresholds.extremely_poor;
      }

      if (concentration <= threshold.good) return this.thresholds.good;
      if (concentration <= threshold.fair) return this.thresholds.fair;
      if (concentration <= threshold.moderate) return this.thresholds.moderate;
      if (concentration <= threshold.poor) return this.thresholds.poor;
      if (concentration <= threshold.very_poor)
        return this.thresholds.very_poor;
      return this.thresholds.extremely_poor;
    },
    getIntensityLabel(intensity) {
      return `
        <div class="intensity-label">
          <i class="threshold-intensity" style="background-color: ${intensity.color}"></i>
          <span>${intensity.label}</span>
        </div>
      `;
    },
    disconnectSocket() {
      if (!this.socket) return;

      this.socket.disconnect();
      this.socket = null;
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    },
    handleMarkerClick(marker) {
      if (!marker) return;
      this.centerMapOnSensor(marker);
      this.addInfo(`Selected sensor from map: ${marker.id}`);
    },
    handleMeasurementRowClick(row) {
      // Center map on the sensor that sent this measurement
      const sensor = this.sensors.data.get(row.sensor_id);
      if (!sensor)
        return this.addWarning(
          `Sensor ${row.sensor_id} not found in registered sensors`
        );
      this.centerMapOnSensor(sensor);
      this.addInfo(`Selected sensor: ${row.sensor_id}`);
    },
    addInfo(msg) {
      this.$refs.logComponent?.addInfo(msg);
    },
    addWarning(msg) {
      this.$refs.logComponent?.addWarning(msg);
    },
    addError(msg) {
      this.$refs.logComponent?.addError(msg);
    },
    clearMeasurements() {
      this.collectedMeasurement.data = [];
    },
    clearStats() {
      for (const [key, data] of Object.entries(this.measurements))
        this.statsMeasurement.data[key] = {
          measurement: data.label,
          mean: "N/A",
          median: "N/A",
          min: "N/A",
          max: "N/A",
          range: "N/A",
          quality: "N/A",
        };
    },
    clearLog() {
      this.$refs.logComponent?.clearLog();
    },
    handleSensorsLoaded(sensors) {
      this.sensors.data = sensors;
      console.log(this.sensors.data);
      for (const sensor of this.sensors.data.values()) {
        sensor.distanceFromCenter = this.calculateDistance(
          this.center.lat,
          this.center.lng,
          sensor.lat,
          sensor.lng
        ).toFixed(2);
        sensor.lastMeasurementReceived = "N/A";
        sensor.lastMeasurementReceivedRaw = null;
        sensor.timeSinceLastMeasurement = "N/A";
      }
      this.addInfo(`Loaded ${sensors.size} sensors`);
    },
    refreshSensors() {
      this.$refs.mapComponent?.refreshSensorData();
      this.addInfo("Refreshed sensors");
    },
    refreshTable() {
      this.addInfo("Refreshed measurements table");
    },
    handleMeasurementsCleared(count) {
      this.addInfo(`Cleared ${count} measurements from map`);
    },
    handleActiveSensors() {
      if (this.activeSensors) this.addInfo("Stopped sensors data reception");
      else this.addInfo("Started sensors data reception");
      this.activeSensors = !this.activeSensors;
    },
    centerMapOnSensor(sensor) {
      if (!this.$refs.mapComponent) return;
      if (!sensor.lat) return;
      if (!sensor.lng) return;

      const mapContainer = document.querySelector(
        ".dashboard-component.map-component-container"
      );
      mapContainer?.scrollIntoView({ behavior: "smooth" });
      this.$refs.mapComponent?.centerOnLocation(sensor.lat, sensor.lng);
    },
    handleSensorRowClick(row) {
      this.addInfo(`Selected sensor: ${row.id}`);
      this.centerMapOnSensor(row);
    },
    createInfoIcon(title) {
      return `<i class="fas fa-info-circle" title="${title}"></i>`;
    },*/
/**
 * Function to calculate the distance between two geographic points (Haversine formula)
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
/*calculateDistance(lat1, lon1, lat2, lon2) {
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
    },
    showForm({ longitude, latitude, address }) {
      this.address = address;
      this.longitude = longitude;
      this.latitude = latitude;
      this.isFormVisible = true;
    },
    hideForm() {
      this.isFormVisible = false;
    },
    async handleSubmit(formData) {
      try {
        const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
        const jsonResponse = await fetch(`${apiUrl}/api/createSensor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set content type to application/json
          },
          body: JSON.stringify({
            name: formData.name, // String, descriptive name of the sensor
            location: {
              type: "Point", // String, indicates it's a point type for GeoJSON
              coordinates: [formData.longitude, formData.latitude], // Array of numbers representing longitude and latitude
            },
            active: formData.active, // Boolean, indicates if the sensor is currently active
            last_seen: new Date(), // Date, timestamp of the last time the sensor was seen
          }),
        });
        const response = await jsonResponse.json();
        if (!response) throw new Error(response || "API request failed");
        this.hideForm();
        this.refreshSensors();
      } catch (error) {
        console.error("Unable to send sensor to API:", error);
      }
    },
  },*/
</script>

<template>
  <div class="app">
    <h1>AirQualityInsight - Dashboard</h1>
    <p>Current route path: {{ $route.fullPath }}</p>
    <nav>
      <RouterLink to="/map"> Go to map </RouterLink>
    </nav>
    <div class="dashboard">
      <RouterView></RouterView>
    </div>
  </div>
  <!--
        <div class="how-to-use-it">
          <h2>How to use it</h2>
          <ul>
            <li>
              The map displays a collection of sensors indicated by red
              pushpins.
            </li>
            <li>Clicking on a sensor will show its name.</li>
            <li>
              Collected live measurements are displayed in a table below the
              map, and clicking on a row will navigate to the corresponding
              sensor on the map.
            </li>
            <li>
              The map shows collected measurements as a heatmap based on the
              selected measurement type.
            </li>
            <li>You can choose from available options in the control panel.</li>
            <li>
              The control panel opens by clicking the red pushpin in the top
              right corner of the map.
            </li>
            <li>
              Opening the panel provides information such as the number of
              registered sensors and collected measurements.
            </li>
            <li>
              You can select the measurement type to display and any layers to
              overlay.
            </li>
            <li>
              Data collection can be stopped and resumed at any time using the
              buttons in the top right corner of the map.
            </li>
            <li>
              Collected measurements have a limit between
              {{ this.minMeasurements }} and {{ this.maxMeasurements }}, after
              which new recordings replace the oldest ones following a FIFO
              (first in, first out) system.
            </li>
          </ul>
        </div>
      </div>
     
      <div class="dashboard-component map-component-container">
        <div class="component-header">
          <h2>Map</h2>
          <div class="component-header-buttons">
            <button @click="refreshSensors" class="btn">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <button
              @click="handleActiveSensors"
              :class="['btn', { 'btn-danger': this.activeSensors }]"
            >
              <i
                :class="[
                  'fas',
                  {
                    'fa-stop': this.activeSensors,
                    'fa-play': !this.activeSensors,
                  },
                ]"
              ></i>
              {{ this.activeSensors ? "Stop" : "Start" }}
            </button>
          </div>
        </div>
        <MapComponent
          ref="mapComponent"
          :measurements="measurements"
          :get-intensity="getIntensity"
          :min-measurements="minMeasurements"
          :max-measurements="maxMeasurements"
          :thresholds="thresholds"
          :calculate-stats="calculateStats"
          @marker-click="handleMarkerClick"
          @sensors-loaded="handleSensorsLoaded"
          @measurements-cleared="handleMeasurementsCleared"
          @open-form="showForm"
        />
        <FormComponent
          v-if="isFormVisible"
          @close-form="hideForm"
          @submit-form="handleSubmit"
          :initial-latitude="latitude"
          :initial-longitude="longitude"
          :initial-address="address"
        ></FormComponent>
      </div>

      <div class="dashboard-component eaqi-component-container">
        <div class="component-header">
          <h2>Current EAQI (European Air Quality Index)</h2>
        </div>
        <div>
          <div>
            The EAQI (European Air Quality Index) is and index based on
            concentration values for up to five key pollutants:
            <ul>
              <li>Particulate matter (PM10)</li>
              <li>Fine particulate matter (PM2.5)</li>
              <li>Nitrogen dioxide (NO2)</li>
              <li>Ozone (O3)</li>
              <li>Sulphur dioxide (SO2)</li>
            </ul>
            Each pollutant gets a sub-index based on its concentration against
            the EAQI thresholds. The worst sub-index among all measured
            pollutants becomes the overall EAQI.
          </div>
          <div v-if="this.eaqi">
            <h3>Live EAQI</h3>
            <ul>
              <li style="display: flex; gap: 0.5rem">
                Quality: <span v-html="this.eaqi?.quality ?? 'N/A'"></span>
              </li>
              <li>Worst pollutant: {{ this.eaqi?.measurement ?? "N/A" }}</li>
              <li>Mean concentration: {{ this.eaqi?.mean ?? "N/A" }} µg/m³</li>
              <li>
                Health advice:
                <ul>
                  <li>
                    General population:
                    {{ this.eaqi?.intensity?.advice?.general ?? "N/A" }}
                  </li>
                  <li>
                    Sensitive population:
                    {{ this.eaqi?.intensity?.advice?.sensitive ?? "N/A" }}
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="dashboard-component measurements-component-container">
        <div class="component-header">
          <h2>Last {{ this.maxMessages }} measurements received</h2>
          <div class="component-header-buttons">
            <button @click="refreshTable" class="btn">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <button @click="clearMeasurements" class="btn btn-danger">
              <i class="fas fa-trash"></i> Clear
            </button>
          </div>
        </div>
        <TableComponent
          ref="measurementComponent"
          :data="collectedMeasurement.data"
          :columns="collectedMeasurement.columns"
          @row-click="handleMeasurementRowClick"
        />
      </div>

      <div class="dashboard-component stats-component-container">
        <div class="component-header">
          <h2>Statistics</h2>
          <button @click="clearStats" class="btn btn-danger">
            <i class="fas fa-trash"></i> Clear
          </button>
        </div>
        <TableComponent
          ref="measurementComponent"
          :data="Object.values(statsMeasurement.data)"
          :columns="statsMeasurement.columns"
        />
      </div>

      <div class="dashboard-component log-component-container">
        <div class="component-header">
          <h2>
            System Log
            <i
              class="fas fa-info-circle"
              :title="
                'Last ' + this.$refs.logComponent?.maxEntries + ' entries'
              "
            ></i>
          </h2>
          <button @click="clearLog" class="btn btn-danger">
            <i class="fas fa-trash"></i> Clear
          </button>
        </div>
        <LogComponent ref="logComponent" />
      </div>

      <div class="dashboard-component sensors-component-container">
        <div class="component-header">
          <h2>Registered sensors: {{ this.sensors.data.size }}</h2>
          <div>
            <button @click="refreshSensors" class="btn">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>
        <TableComponent
          ref="sensorsComponent"
          :data="Array.from(sensors.data.values())"
          :columns="sensors.columns"
          @row-click="handleSensorRowClick"
        />-->
</template>

<style src="./assets/style.scss"></style>
<style lang="scss">
body {
  font-family: "Arial", sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
}

.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard {
  display: grid;
  grid-template-areas:
    "info"
    "map"
    "measurements"
    "stats"
    "log"
    "sensors";
  grid-template-columns: 1fr;
  gap: 1.5rem;

  &-component {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    overflow: hidden;
  }
}

.info-component-container {
  grid-area: info;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .description,
  .measurement-ranges,
  .how-to-use-it {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h2 {
      margin-bottom: 0.5rem;
    }
  }

  .description .project-link {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .description p:not(.project-link) {
    display: flex;
    flex-direction: column;
  }

  .measurement-ranges .table-wrapper {
    height: auto;
  }

  .how-to-use-it ul {
    margin-left: 1rem;
  }
}

.eaqi-component-container {
  grid-area: eaqi;
  min-width: 0;
  height: 100%;

  h3 {
    margin-top: 1rem;
  }

  ul {
    padding: 0.5rem 1rem;
  }
}

.map-component-container {
  grid-area: map;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
}

.measurements-component-container {
  grid-area: measurements;
  min-width: 0;
  height: 100%;
}

.stats-component-container {
  grid-area: stats;
  min-width: 0;
  height: 100%;
}

.log-component-container {
  grid-area: log;
  overflow-y: hidden;
  height: 600px;

  .log-container {
    margin-bottom: 1rem;
    max-height: 100%;
  }

  .fa-info-circle {
    cursor: pointer;
  }
}

.stats-component-container,
.log-component-container {
  max-height: 600px;
}

.sensors-component-container {
  grid-area: sensors;
}

tbody tr {
  font-family: monospace;
  font-size: 14px;
}

thead tr {
  background-color: #f0f0f0;
}

tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.component-header-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #45a049;
  }

  &-danger {
    background-color: #f44336;

    &:hover {
      background-color: #d32f2f;
    }
  }
}

@media (min-width: 768px) {
  .dashboard {
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas:
      "info info info"
      "eaqi eaqi eaqi"
      "map map map"
      "measurements measurements measurements"
      "stats stats log"
      "sensors sensors sensors";
  }
}

.intensity-label {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-start;
}

.threshold-intensity {
  width: 16px;
  height: 16px;
  border: solid 0.5px black;
  border-radius: 50%;
}

.table-row td:has(.intensity-label) {
  width: 200px;
}
</style>
