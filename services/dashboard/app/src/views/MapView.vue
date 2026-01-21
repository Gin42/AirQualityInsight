<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import MapComponent from "@/assets/components/MapComponent.vue";
import FormComponent from "@/assets/components/FormComponent.vue";
import TableComponent from "@/assets/components/TableComponent.vue";
import SensorInfoComponent from "@/assets/components/SensorInfoComponent.vue";
import MapButtonComponent from "@/assets/components/MapButtonComponent.vue";
import SettingsComponent from "@/assets/components/SettingsComponent.vue";
import SensorCardsComponent from "@/assets/components/SensorCardsComponent.vue";

export default {
  name: "MapView",
  components: {
    MapComponent,
    FormComponent,
    TableComponent,
    SensorInfoComponent,
    MapButtonComponent,
    SettingsComponent,
    SensorCardsComponent,
  },
  computed: {
    ...mapState({
      minMeasurements: (state) => state.measurements.minMeasurements,
      maxMeasurements: (state) => state.measurements.maxMeasurements,
    }),
    ...mapGetters("data", ["getMeasurementsTypes", "getThresholds"]),
    ...mapGetters("sensors", ["allSensorsCount", "allSensors"]),
    ...mapGetters("table", ["getSensorsTable"]),
  },
  data() {
    return {
      map: null,
      activeSensors: true,
      timeUpdateInterval: null,
      isFormVisible: false,
      isInfoVisible: false,
      isSettingsVisible: false,
      latitude: null,
      longitude: null,
      address: null,
      selectedSensor: null,
    };
  },
  created() {},
  methods: {
    ...mapMutations(["setSocketActive"]),
    ...mapActions("sensors", ["updateTimeSinceLastMeasurements"]),

    refreshSensors() {
      console.log("refresh");
      this.$refs.mapComponent?.refreshSensorData();
      //this.addInfo("Refreshed sensors");
    },
    handleActiveSensors() {
      if (this.activeSensors) {
        this.setSocketActive({ value: false });
        console.log("Stopped sensors data reception");
        //this.addInfo("Stopped sensors data reception");
      } else {
        this.setSocketActive({ value: true });
        console.log("Started sensors data reception");
        //this.addInfo("Started sensors data reception");
      }
      this.activeSensors = !this.activeSensors;
    },
    handleMarkerClick(sensor) {
      if (!sensor) return;
      console.log(`Selected sensor from map: ${sensor}`);
      this.centerMapOnSensor(sensor);
      this.selectedSensor = sensor;
      this.showInfo();
      //this.addInfo(`Selected sensor from map: ${marker.id}`);
    },
    handleSensorsLoaded(sensors) {
      //this.addInfo(`Loaded ${sensors.size} sensors`);
    },
    handleMeasurementsCleared(count) {
      console.log("Cleared measurement");
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
    showInfo() {
      this.isInfoVisible = true;
    },
    hideInfo() {
      this.isInfoVisible = false;
    },

    showSettings() {
      console.log("Settings TIME");
      this.isSettingsVisible = true;
    },
    hideSettings() {
      this.isSettingsVisible = false;
    },
    centerMapOnSensor(sensor) {
      if (!this.$refs.mapComponent) return;
      if (!sensor.getLat()) return;
      if (!sensor.getLng()) return;

      const mapContainer = document.querySelector(
        ".dashboard-component.map-component-container",
      );
      mapContainer?.scrollIntoView({ behavior: "smooth" });
      this.$refs.mapComponent?.centerOnLocation(
        sensor.getLat(),
        sensor.getLng(),
      );
    },
    handleSensorRowClick(row) {
      console.log(`Selected sensor: ${row.id}`);
      //this.addInfo(`Selected sensor: ${row.id}`);
      this.centerMapOnSensor(row);
    },
  },
};
</script>

<template>
  <!-- Main element: should contain settings, map and sensor info if selected -->
  <div class="dashboard-component map-component-container">
    <div class="component-header-buttons">
      <!-- Refresh and stop buttons -->
      <button @click="refreshSensors" class="btn tertiary-color">
        <i class="fas fa-sync-alt"></i> Refresh
      </button>
      <button @click="handleActiveSensors" class="btn tertiary-color">
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

    <MapComponent
      ref="mapComponent"
      :thresholds="getThresholds"
      @marker-click="handleMarkerClick"
      @sensors-loaded="handleSensorsLoaded"
      @measurements-cleared="handleMeasurementsCleared"
      @open-form="showForm"
    />

    <transition name="slide-left">
      <SettingsComponent
        v-if="isSettingsVisible"
        @close-settings="hideSettings"
      ></SettingsComponent>
    </transition>

    <MapButtonComponent
      @open-settings="showSettings"
      @open-info="showInfo"
    ></MapButtonComponent>

    <transition name="slide-right">
      <SensorInfoComponent
        v-if="isInfoVisible"
        @close-info="hideInfo"
        :sensor="selectedSensor"
      >
      </SensorInfoComponent>
    </transition>

    <!-- Add sensor Form -->
    <FormComponent
      v-if="isFormVisible"
      @close-form="hideForm"
      :initial-latitude="latitude"
      :initial-longitude="longitude"
      :initial-name="name"
    ></FormComponent>
  </div>

  <!-- Registered sensors list -->
  <div class="dashboard-component sensors-component-container">
    <div class="component-header">
      <h2>Registered sensors: {{ allSensorsCount }}</h2>
      <div>
        <button @click="refreshSensors" class="btn">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
    </div>
    <TableComponent
      ref="sensorsComponent"
      :data="allSensors"
      :columns="getSensorsTable.columns"
      @row-click="handleSensorRowClick"
    />
  </div>

  <!-- CHECK da discutere con Kelvin. A mio parere a livello mobile è meglio
   perchè le tabelle mobile sono uno schifo, però a livello desktop sono davvero tanti. 
   O si mette una funzione di ricerca al posto dell'ordine
  <SensorCardsComponent :data="allSensors"></SensorCardsComponent>
  -->
</template>

<style lang="scss">
.component-header-buttons {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 3 / 2 / 4;
  z-index: 1;
  gap: 0.5rem;
  align-items: end;
}

.btn {
  color: white;
  padding: 0.5rem;
  font-size: 1em;
  height: fit-content;
  width: fit-content;
  gap: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.map-component-container {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}
</style>
