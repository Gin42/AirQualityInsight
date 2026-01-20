<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
export default {
  name: "SettingsComponent",
  data() {
    return {
      isCollapsibleOpen: false,
      showHelpPopup: false,
      tooltipPosition: "left",
    };
  },
  computed: {
    ...mapState({
      minMeasurements: (state) => state.minMeasurements,
      maxMeasurements: (state) => state.maxMeasurements,
      sensors: (state) => state.sensors.sensors,
      center: (state) => state.center,
      newMeasurement: (state) => state.measurements.measurements,
      lastChange: (state) => state.sensors.lastChange,
      currentMeasurements: (state) => state.currentMeasurements,
    }),
    ...mapGetters("measurements", ["lastMeasurement", "allMeasurementsCount"]),
    ...mapGetters("sensors", ["getSensor", "allSensorsCount", "allSensors"]),
    ...mapGetters("socket", ["isSocketConnected", "isServerReady"]),
    sliderValue: {
      get() {
        return this.currentMeasurements;
      },
      set(value) {
        this.setCurrentMeasurements(value);
      },
    },
  },
  methods: {
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
  },
};
</script>

<template>
  <div class="settings bg-color">
    <button class="close-button" @click="$emit('close-settings')">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <!-- Map instructions -->
    <div class="collapsible-header secondary-color" @click="toggleCollapsible">
      <h2>How to use it</h2>
      <button class="collapsible-button" @click="toggleCollapsible">
        <i class="fa-solid fa-angle-down" v-if="!isCollapsibleOpen"></i>
        <i class="fa-solid fa-angle-up" v-if="isCollapsibleOpen"></i>
      </button>
    </div>

    <ul
      class="how-to-list collapsible-content secondary-color"
      v-if="isCollapsibleOpen"
    >
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
        <p>Latitude:</p>
        <p>{{ center.lat }}</p>
      </li>
      <li>
        <p>Longitute:</p>
        <p>{{ center.lng }}</p>
      </li>
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
                class="help-popup"
                v-if="showHelpPopup"
                :class="tooltipPosition"
                ref="helpPopup"
              >
                The higher the limit, the more accurate the measurements.
              </div>
            </div>
          </div>

          <input
            id="parameter-slider"
            type="range"
            v-model="sliderValue"
            :min="this.minMeasurements"
            :max="this.maxMeasurements"
            step="10"
          />
        </div>
      </li>
    </ul>

    <!--<pre>
          <span>Zoom:</span>
          <span>{{ this.zoom }}</span>
        </pre>
    <button class="copy-btn" id="coordinates-copy-btn">Copy</button>
    <button
      v-for="(value, key) in show"
      :key="key"
      class="toggle-btn"
      @click="toggleLayer(key)"
      :class="{ active: value }"
    >
      {{ value ? "Hide" : "Show" }}
      {{ getDisplayName(key) }}
    </button>

    <hr />
    <div class="measurements-controls">
      <label><strong>Measurement:</strong></label>
      <select v-model="selectedMeasurement" @change="updateHeatmap">
        <option
          v-for="type in Object.keys(this.measurements)"
          :key="type"
          :value="type"
        >
          {{ this.measurements[type].label }}
        </option>
      </select>
    </div>-->

    <p>Limit of measurements:</p>

    <!--Chiedere utilità del poter cancellare il conto delle misurazioni:
            deve essere un'operazione che cancella in generale le misurazioni?
            oppure è fittizia e sta solo segnando quante se ne sono registrate?
            oppure serve per la heatmap?
        -->
    <div class="measurements-controls">
      <p>Current measurements:</p>
      <p>
        {{ allMeasurementsCount }}
      </p>
    </div>

    <button
      @click="clearMeasurements"
      class="btn btn-danger clear-measurements"
    >
      <i class="fas fa-trash"></i> Clear
    </button>
    <hr />

    <!--
    <div class="grid-controls">
      <label><strong>Grid:</strong></label>
      <select
        id="grid-select"
        v-model="gridType"
        class="grid-select"
        @change="onGridChange"
      >
        <option value="none">None</option>
        <option value="gray">Gray</option>
        <option value="red">Red</option>
        <option value="crosshair">Crosshair</option>
      </select>
    </div>-->
  </div>
</template>

<style>
.close-button {
  background: transparent;
  align-self: end;
  font-size: 1.5em;
  margin: 0.3rem;
}

.settings {
  grid-area: 1 / 1 / 4 / 6;
  display: flex;
  flex-direction: column;
  z-index: 2;
  padding: 0 1rem 1rem 1rem;
  border: 2px solid black;
}

ul.how-to-list {
  flex-direction: column;
  list-style-type: disc;
  margin: 0;
  padding-bottom: 2rem;
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

.settings-list li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 1em;
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
  position: absolute;
  bottom: 80%;
  max-width: 10rem;
  padding: 0.5rem 0.75rem;
  background-color: #222;
  color: #fff;
  border-radius: 6px 6px 0px 6px;
  font-size: 0.85rem;
  white-space: normal;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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
</style>
