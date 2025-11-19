<!-- components/MapComponent.vue -->
<script src="./logic/MapLogic.js"></script>
<template>
  <div class="map">
    <div class="map-container">
      <!--<div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
      </div>-->
      <div id="map"></div>
      <div
        v-if="gridType === 'gray'"
        class="map-grid-overlay map-grid-overlay--gray"
      ></div>
      <div
        v-if="gridType === 'red'"
        class="map-grid-overlay map-grid-overlay--red"
      ></div>
      <div
        v-if="gridType === 'crosshair'"
        class="map-grid-overlay map-grid-overlay--crosshair"
      ></div>
      <div class="center-marker">
        <div class="icon"></div>
      </div>

      <div
        :class="['controls', { pinned: isPinned }]"
        :aria-expanded="isHovered"
        @mouseover="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div class="tools">
          <h2>Controls</h2>
          <!--Il dover cliccare il pushpin per fissare il pannello delle impostazioni non è chiara come cosa-->
          <div
            class="pushpin"
            @click="isPinned = !isPinned"
            title="Pin / Unpin"
          ></div>
        </div>

        <pre>
          <span>Markers:</span>
          <span>{{ allSensorsCount }}</span>
        </pre>

        <hr />
        <pre>
          <span>Latitude:</span>
          <span>{{ center.lat }}</span>
        </pre>
        <pre>
          <span>Longitude:</span>
          <span>{{ center.lng }}</span>
        </pre>
        <pre>
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
        </div>

        <p>Limit of measurements:</p>
        <div class="measurements-controls">
          <input
            id="parameter-slider"
            type="range"
            v-model="this.maxHeatLatLng"
            :min="this.minMeasurements"
            :max="this.maxMeasurements"
            step="10"
          />
          <!--Da trovare un'altra soluzione per questo suggerimento-->
          <span
            class="help"
            title="The higher the limit, the more accurate the measurements."
            >{{ this.maxHeatLatLng }}</span
          >
        </div>

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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.map {
  height: 100%;
  background-color: #f1e3f3;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  &-overlay {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #f1e3f3;
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
  //?Quale marker?
  &-marker {
    width: 20px;
    height: 20px;
    background-color: #3590f3;
    border-radius: 50%;
    position: absolute;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }
}

.no-data {
  color: #666;
  font-style: italic;
}

.map-container {
  height: 100%;
  width: 100%;

  #map {
    height: 100%;
    width: 100%;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(
        to right,
        rgba(255, 255, 255, 0.3) 1px,
        transparent 1px
      ),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
    z-index: 400;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &.show-grid::before {
    opacity: 1;
  }
}

.map-grid-overlay {
  --red-line-color: #3590f3;
  --gray-line-color: rgba(0, 0, 0, 0.25);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 400;

  &--gray {
    border-bottom: solid 1px var(--gray-line-color);
    border-right: solid 1px var(--gray-line-color);
    background-image: linear-gradient(
        to right,
        var(--gray-line-color) 1px,
        transparent 1px
      ),
      linear-gradient(to bottom, var(--gray-line-color) 1px, transparent 1px);
    background-size: 5% 5%;
  }

  &--red {
    border-bottom: solid 2px var(--red-line-color);
    border-right: solid 2px var(--red-line-color);
    background-image: linear-gradient(
        to right,
        var(--red-line-color) 2px,
        transparent 2px
      ),
      linear-gradient(to bottom, var(--red-line-color) 2px, transparent 2px);
    background-size: 10% 10%;
  }

  &--crosshair {
    border: solid 2px var(--red-line-color);

    &::before,
    &::after {
      content: "";
      position: absolute;
      background: var(--red-line-color);
    }

    &::before {
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      transform: translateY(-50%);
    }

    &::after {
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      transform: translateX(-50%);
    }
  }
}

.controls {
  width: 44px;
  height: 44px;
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  transition: all 250ms ease-in-out;
  border: 2px solid rgba(0, 0, 0, 0.2);
  overflow-x: hidden;

  background-color: #f1e3f3;
  background-clip: padding-box;
  background-size: 24px 24px;
  background-image: url("../pushpin.svg");
  background-repeat: no-repeat;
  background-position-x: center;
  background-position-y: center;

  & * {
    display: none;
    opacity: 0;
    visibility: hidden;
  }

  &[aria-expanded="true"],
  &.pinned {
    background: #f1e3f3;
    width: 18rem;
    height: auto;

    & * {
      display: inherit;
      opacity: 1;
      visibility: visible;
    }
  }

  &.pinned .pushpin {
    background-color: #f0f0f0 !important;
    transform: scale(1.1) rotate(30deg);
  }

  .tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    width: 100%;

    .pushpin {
      background-clip: padding-box;
      background-size: 24px 24px;
      background-image: url("../pushpin.svg");
      background-repeat: no-repeat;
      background-position-x: center;
      background-position-y: center;
      width: 40px;
      height: 40px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 50%;

      &:hover {
        background-color: #f0f0f0;
        transform: scale(1.1) rotate(30deg);
      }
    }
  }

  pre {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  hr {
    width: 100%;
    margin: 0.5rem 0;
  }

  .measurements-controls + p {
    margin-top: 1rem;
  }

  .measurements-controls .help {
    cursor: help;
  }

  .measurements-controls,
  .grid-controls {
    display: flex;
    justify-content: space-between;
    width: 100%;

    select {
      padding: 0 0.25rem;
    }
  }

  .measurements-controls {
    gap: 1rem;

    #parameter-slider {
      width: 100%;
    }
  }
}

.info {
  padding: 0.5rem;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;

  h4 {
    margin: 0 0 0.5rem;
    color: #777;
  }
}

.legend {
  line-height: 1.5rem;
  color: #555;
}

.center-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 998;
  pointer-events: none;

  .icon {
    width: 25px;
    height: 25px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;

    &::before {
      content: "+";
      font-size: 1.75rem;
      color: #3590f3;
      font-weight: bold;
    }
  }
}

@mixin button-base {
  width: 100%;
  border: none;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

// Button hover effect
@mixin button-hover {
  &:hover {
    background-color: #dfdfdf;
  }
}

// Basic toggle button
.toggle-btn {
  @include button-base;
  @include button-hover;
}

// Copy button with additional states
.copy-btn {
  @include button-base;
  @include button-hover;

  background-color: #4caf50;
  color: white;

  &:hover {
    background-color: #45a049;
  }

  &:active {
    background-color: #3e8e41;
  }

  &.copied {
    background-color: #45a049;
  }
}

.content-frozen {
  pointer-events: none;
  filter: blur(2px);
  opacity: 0.7;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .spinner {
    border: 0.25rem solid #f3f3f3;
    border-top: 0.25rem solid #007bff;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}

.loading-gif {
  width: 80px;
  height: 80px;
}

//Da vedere quando succede
.pulsing-marker {
  background: transparent;
  border: none;
}

.pulse {
  --bg-color: #ff4444;
  width: 20px;
  height: 20px;
  background-color: var(--bg-color);
  border-radius: 50%;
  position: relative;
  animation: pulse 2s infinite;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
    border-radius: 50%;
    animation: pulse-ring 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.clear-measurements {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
