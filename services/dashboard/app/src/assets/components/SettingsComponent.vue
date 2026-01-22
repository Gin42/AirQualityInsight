<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
export default {
  name: "SettingsComponent",
  data() {
    return {
      isCollapsibleOpen: false,
      showHelpPopup: false,
      tooltipPosition: "left",
      showCopiedPopup: false,
      bubbleLeft: 0,
    };
  },
  computed: {
    ...mapState({
      minMeasurements: (state) => state.measurements.minMeasurements,
      maxMeasurements: (state) => state.measurements.maxMeasurements,
      center: (state) => state.map.center,
      currentMeasurements: (state) => state.measurements.currentMeasurements,
      zoom: (state) => state.map.zoom,
      gridTypeState: (state) => state.map.gridType,
      selectedMeasurementState: (state) => state.map.selectedMeasurement,
      currentCoords: (state) => state.map.currentCoords,
    }),
    ...mapGetters("measurements", ["lastMeasurement", "allMeasurementsCount"]),
    ...mapGetters("data", ["getMeasurementsTypes", "getThresholds"]),
    ...mapGetters("sensors", ["getSensor", "allSensorsCount", "allSensors"]),
    sliderValue: {
      get() {
        return this.currentMeasurements;
      },
      set(value) {
        this.setCurrentMeasurements(value);
      },
    },
    selectedMeasurement: {
      get() {
        return this.selectedMeasurementState;
      },
      set(value) {
        this.setSelectedMeasurement(value);
      },
    },
    gridType: {
      get() {
        return this.gridTypeState;
      },
      set(value) {
        this.setGridType(value);
      },
    },
  },
  methods: {
    ...mapMutations("measurements", ["setCurrentMeasurements"]),
    ...mapMutations("map", ["setSelectedMeasurement", "setGridType"]),
    toggleCollapsible() {
      this.isCollapsibleOpen = !this.isCollapsibleOpen;
      console.log(this.isCollapsibleOpen);
    },
    showTooltip() {
      this.showHelpPopup = true;

      this.$nextTick(() => {
        const tooltip = this.$refs.helpPopup;
        if (!tooltip) return;
      });
    },

    hideTooltip() {
      this.showHelpPopup = false;
    },
    copyCoords() {
      const coordText = `${this.currentCoords.lat}\t${this.currentCoords.lng}`;

      navigator.clipboard
        .writeText(coordText)
        .then(() => {
          this.showCopiedPopup = true;

          setTimeout(() => {
            this.showCopiedPopup = false;
          }, 3000);
        })
        .catch((err) => {
          console.error("Error copying coordinates: ", err);
          alert("Could not copy coordinates. Try doing it manually.");
        });
    },
    updateBubblePosition() {
      const min = this.minMeasurements;
      const max = this.maxMeasurements;
      const val = this.sliderValue;

      this.bubbleLeft = ((val - min) / (max - min)) * 100;
    },
    onGridChange() {
      const mapContainer = document.querySelector(".map-container");
      if (!mapContainer) return;
      mapContainer.classList.remove(
        "grid-simple",
        "grid-dark",
        "grid-fine",
        "grid-coordinate",
        "grid-crosshair",
        "grid-dashed",
        "grid-dots",
        "grid-animated",
      );
      if (this.gridType !== "none")
        mapContainer.classList.add(`grid-${this.gridType}`);
    },
  },
  mounted() {
    this.updateBubblePosition();
    console.log("Measurements types:", this.getMeasurementsTypes);
  },
};
</script>

<template>
  <div class="settings surface-color">
    <button class="icon-button" @click="$emit('close-settings')">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <!-- Map instructions -->
    <div class="collapsible-header" @click="toggleCollapsible">
      <h2>How to use it</h2>
      <button class="collapsible-button">
        <i class="fa-solid fa-angle-down" v-if="!isCollapsibleOpen"></i>
        <i class="fa-solid fa-angle-up" v-if="isCollapsibleOpen"></i>
      </button>
    </div>

    <ul class="how-to-list collapsible-content" v-if="isCollapsibleOpen">
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

    <!-- Map settings -->

    <h2>Map settings</h2>

    <ul class="settings-list">
      <li>
        <p>Registered sensors:</p>
        <p>{{ allSensorsCount }}</p>
      </li>
      <li>
        <p>Coordinates:</p>
        <p>{{ currentCoords.lat }} / {{ currentCoords.lng }}</p>
        <div class="copy-wrapper">
          <button class="copy-button" @click="copyCoords">
            <i class="fa-regular fa-copy"></i>
          </button>

          <transition name="fade">
            <div v-if="showCopiedPopup" class="copied-popup popup">
              Copied to clipboard
            </div>
          </transition>
        </div>
      </li>
      <li>
        <p>Zoom:</p>
        <p>{{ zoom }}</p>
      </li>

      <hr />
      <li>
        <div class="measurements-controls">
          <div class="measurements-controls-header">
            <p>Limit of measurements:</p>
            <div class="info-tooltip">
              <i
                class="fa-solid fa-circle-info"
                @mouseenter="showTooltip"
                @mouseleave="hideTooltip"
                @click.prevent="showTooltip"
              ></i>

              <div
                class="help-popup popup"
                v-if="showHelpPopup"
                :class="tooltipPosition"
                ref="helpPopup"
              >
                The higher the limit, the more accurate the measurements.
              </div>
            </div>
          </div>
          <div class="slider-containter">
            <p>{{ minMeasurements }}</p>
            <div class="slider-wrapper">
              <div class="slider-bubble" :style="{ left: bubbleLeft + '%' }">
                {{ sliderValue }}
              </div>
              <input
                id="parameter-slider"
                type="range"
                v-model="sliderValue"
                :min="minMeasurements"
                :max="maxMeasurements"
                step="10"
                @input="updateBubblePosition"
              />
            </div>
            <p>{{ maxMeasurements }}</p>
          </div>
        </div>
      </li>

      <li>
        <p>Measurement:</p>
        <select v-model="selectedMeasurement">
          <option
            v-for="(measurement, type) in getMeasurementsTypes"
            :key="type"
            :value="type"
          >
            {{ measurement.label }}
          </option>
        </select>
      </li>
      <li class="curr-measurements-li">
        <p>Current measurements:</p>
        <p>{{ allMeasurementsCount }}</p>
        <button
          @click="clearMeasurements"
          class="btn danger-color clear-measurements"
        >
          <i class="fas fa-trash"></i> Clear
        </button>
      </li>

      <hr />
      <li>
        <p>Grid:</p>
        <select
          id="grid-select"
          v-model="gridType"
          class="grid-select"
          @change="onGridChange"
        >
          <option value="none">None</option>
          <option value="gray">Gray</option>
          <option value="blue">Blue</option>
          <option value="crosshair">Crosshair</option>
        </select>
      </li>
    </ul>
  </div>
</template>

<style>
.copy-button {
  background: transparent;
  font-size: 1em;
  margin: 0;
}

.copy-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.popup {
  position: absolute;
  background-color: #222;
  color: #fff;
  padding: 0.5rem;
  font-size: 0.75rem;

  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.copied-popup {
  top: -1.5rem;
  right: 0;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.settings {
  grid-area: 1 / 1 / 4 / 4;
  display: flex;
  flex-direction: column;
  z-index: 2;
  padding: 0 1rem 1rem 1rem;
  overflow-y: scroll;
  border-radius: 8px;
}

ul.how-to-list {
  flex-direction: column;
  list-style-type: disc;
  margin: 0;
  padding-bottom: 2rem;
  border: #222 1px solid;
  border-top: transparent;
}

ul.how-to-list li {
  padding-right: 1rem;
}

.collapsible-header {
  cursor: pointer;
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.5rem;
  border: #222 1px solid;
}

.collapsible-button {
  background-color: transparent;
}

.settings-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.settings-list p {
  margin: 0.5rem 0;
}

.settings-list li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 1em;
}

.settings-list li p:first-child {
  font-weight: bold;
}

.coord-header {
  display: inline;
}

.measurements-controls {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.measurements-controls-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.help-popup {
  bottom: 80%;
  max-width: 10rem;
  border-radius: 6px 6px 0px 6px;
  white-space: normal;
}

.fa-circle-info {
  font-size: 1.5em;
}

.fa-circle-info:hover {
  cursor: pointer;
}

.info-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* Shift left if overflowing right */
.help-popup.left {
  right: 0;
  left: auto;
  transform: none;
}

.help-popup::after {
  content: "";
  position: absolute;
  top: 100%;
  border-width: 6px;
  border-style: solid;
  border-color: #222 transparent transparent transparent;
}

.help-popup.right::after {
  left: 10px;
}

.slider-containter {
  font-weight: normal;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  margin: 1rem 0;
}

#parameter-slider {
  width: inherit;
}

.slider-wrapper {
  position: relative;
  width: inherit;
  margin: 0 1rem;
  align-content: center;
}

.slider-bubble {
  position: absolute;
  top: -1rem;
  transform: translateX(-30%);
  background: #222;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  pointer-events: none;
}

.curr-measurements-li {
  margin-top: 1rem;
}

select {
  border: 2px solid black;
}

@media (min-width: 800px) {
  .settings {
    grid-area: 1 / 1 / 4 / 2;
  }
}
</style>
