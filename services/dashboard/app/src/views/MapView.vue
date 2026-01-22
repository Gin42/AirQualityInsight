<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import MapComponent from "@/assets/components/MapComponent.vue";
import FormComponent from "@/assets/components/FormComponent.vue";
import TableComponent from "@/assets/components/TableComponent.vue";
import SensorInfoComponent from "@/assets/components/SensorInfoComponent.vue";
import MapButtonComponent from "@/assets/components/MapButtonComponent.vue";
import SettingsComponent from "@/assets/components/SettingsComponent.vue";
import SensorCardsComponent from "@/assets/components/SensorCardsComponent.vue";
import { TrinityRingsSpinner } from "epic-spinners";

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
    TrinityRingsSpinner,
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
      isLoading: true,
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
      this.selectedSensor = sensor;

      if (sensor) {
        this.centerMapOnSensor(sensor);
        this.showInfo();
      }
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
    toggleInfo() {
      this.isInfoVisible = !this.isInfoVisible;
    },
    showInfo() {
      this.isInfoVisible = true;
    },
    hideInfo() {
      this.isInfoVisible = false;
    },

    toggleSettings() {
      this.isSettingsVisible = !this.isSettingsVisible;
    },
    hideSettings() {
      this.isSettingsVisible = false;
    },

    closeAll() {
      this.hideInfo();
      this.hideSettings();
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
    <div class="component-header-buttons" v-if="!isLoading">
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

    <TrinityRingsSpinner
      :animation-duration="1500"
      :size="66"
      color="#3590f3"
      class="loading-spinner"
      v-if="isLoading"
    />

    <MapComponent
      ref="mapComponent"
      :thresholds="getThresholds"
      :loading="isLoading"
      @marker-click="handleMarkerClick"
      @measurements-cleared="handleMeasurementsCleared"
      @open-form="showForm"
      @loading-change="isLoading = $event"
    />

    <transition name="slide-left">
      <SettingsComponent
        v-if="isSettingsVisible && !isLoading"
        @close-settings="hideSettings"
      ></SettingsComponent>
    </transition>

    <MapButtonComponent
      @toggle-settings="toggleSettings"
      @toggle-info="toggleInfo"
      @close-all="closeAll"
      v-if="!isLoading"
    ></MapButtonComponent>

    <transition name="slide-right">
      <SensorInfoComponent
        v-if="isInfoVisible && !isLoading"
        @close-info="hideInfo"
        @select-sensor="handleMarkerClick"
        :sensor="selectedSensor"
      >
      </SensorInfoComponent>
    </transition>

    <FormComponent
      v-if="isFormVisible"
      @close-form="hideForm"
      :initial-latitude="latitude"
      :initial-longitude="longitude"
      :initial-name="name"
    ></FormComponent>
  </div>
</template>

<style lang="scss">
.component-header-buttons {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 3 / 2 / 4;
  z-index: 1;
  gap: 0.5rem;
  align-items: end;
  height: fit-content;
  width: fit-content;
  justify-self: end;
  margin: 1rem;
}

.map-component-container {
  height: 90vh;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  margin: 1rem 0;
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

.loading-spinner {
  grid-area: 2 / 2 / 3 / 3;
  z-index: 10;
  pointer-events: none;
  place-self: center;
}
</style>
