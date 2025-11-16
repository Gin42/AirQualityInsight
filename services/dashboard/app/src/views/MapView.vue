<script>
import { mapState, mapGetters, mapActions } from "vuex";
import MapComponent from "@/assets/components/MapComponent.vue";
import FormComponent from "@/assets/components/FormComponent.vue";

export default {
  name: "MapView",
  components: { MapComponent, FormComponent },
  computed: {
    ...mapState({
      minMeasurements: (state) => state.minMeasurements,
      maxMeasurements: (state) => state.maxMeasurements,
    }),
    ...mapGetters("data", ["getMeasurementsTypes", "getThresholds"]),
  },
  data() {
    return {
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
  created() {},
  methods: {
    ...mapActions("stats", ["getIntensity"]),

    refreshSensors() {
      this.$refs.mapComponent?.refreshSensorData();
      //this.addInfo("Refreshed sensors");
    },
    handleActiveSensors() {
      //if (this.activeSensors) this.addInfo("Stopped sensors data reception");
      //else this.addInfo("Started sensors data reception");
      this.activeSensors = !this.activeSensors;
    },
    handleMarkerClick(marker) {
      if (!marker) return;
      this.centerMapOnSensor(marker);
      //this.addInfo(`Selected sensor from map: ${marker.id}`);
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
      //this.addInfo(`Loaded ${sensors.size} sensors`);
    },
    handleMeasurementsCleared(count) {
      //this.addInfo(`Cleared ${count} measurements from map`);
    },
    showForm({ longitude, latitude, name }) {
      this.name = name;
      this.longitude = longitude;
      this.latitude = latitude;
      this.isFormVisible = true;
    },
    hideForm() {
      this.isFormVisible = false;
    },
  },
};
</script>

<template>
  <div class="how-to-use-it">
    <h2>How to use it</h2>
    <ul>
      <li>
        The map displays a collection of sensors indicated by red pushpins.
      </li>
      <li>Clicking on a sensor will show its name.</li>
      <li>
        Collected live measurements are displayed in a table below the map, and
        clicking on a row will navigate to the corresponding sensor on the map.
      </li>
      <li>
        The map shows collected measurements as a heatmap based on the selected
        measurement type.
      </li>
      <li>You can choose from available options in the control panel.</li>
      <li>
        The control panel opens by clicking the red pushpin in the top right
        corner of the map.
      </li>
      <li>
        Opening the panel provides information such as the number of registered
        sensors and collected measurements.
      </li>
      <li>
        You can select the measurement type to display and any layers to
        overlay.
      </li>
      <li>
        Data collection can be stopped and resumed at any time using the buttons
        in the top right corner of the map.
      </li>
      <li>
        Collected measurements have a limit between
        {{ minMeasurements }} and {{ maxMeasurements }}, after which new
        recordings replace the oldest ones following a FIFO (first in, first
        out) system.
      </li>
    </ul>
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
      :measurements="getMeasurementsTypes"
      :min-measurements="minMeasurements"
      :max-measurements="maxMeasurements"
      :thresholds="getThresholds"
      :get-intensity="getIntensity"
      @marker-click="handleMarkerClick"
      @sensors-loaded="handleSensorsLoaded"
      @measurements-cleared="handleMeasurementsCleared"
      @open-form="showForm"
    />
    <FormComponent
      v-if="isFormVisible"
      @close-form="hideForm"
      :initial-latitude="latitude"
      :initial-longitude="longitude"
      :initial-name="name"
    ></FormComponent>
  </div>
</template>
