<!-- components/MapComponent.vue -->
<script src="./logic/MapLogic.js"></script>
<template>
  <div class="map">
    <div class="map-container">
      <div v-if="loading">
        <trinity-rings-spinner
          :animation-duration="1500"
          :size="66"
          color="#ff1d5e"
        />
      </div>

      <div id="map"></div>
      <div
        v-if="gridType === 'gray'"
        class="map-grid-overlay map-grid-overlay--gray"
      ></div>
      <div
        v-if="gridType === 'blue'"
        class="map-grid-overlay map-grid-overlay--blue"
      ></div>
      <div
        v-if="gridType === 'crosshair'"
        class="map-grid-overlay map-grid-overlay--crosshair"
      ></div>
      <div class="center-marker">
        <div class="icon"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
#map {
  height: 500px;
}
.pushpin-icon {
  background: none !important;
  border: none !important;
}
.leaflet-current-layer {
  background-color: white;
  padding: 0.75rem;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer !important;
}

.map {
  height: 50rem; /* MOMENTANEO */
  background-color: #f1e3f3;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: -webkit-fill-available;
  grid-area: 1 / 1 / 4 / 6;
  z-index: 0;

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
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
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
  --blue-line-color: #3590f3;
  --gray-line-color: rgba(0, 0, 0, 0.25);

  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 400;

  transform: translateZ(0);
  backface-visibility: hidden;

  &--gray,
  &--blue {
    --grid-size: clamp(40px, 6vmin, 80px);

    background-size: var(--grid-size) var(--grid-size);
  }

  &--gray {
    border-right: 2px solid var(--gray-line-color);
    border-bottom: 2px solid var(--gray-line-color);

    background-image:
      linear-gradient(to right, var(--gray-line-color) 2px, transparent 2px),
      linear-gradient(to bottom, var(--gray-line-color) 2px, transparent 2px);
  }

  &--blue {
    border-right: 2px solid var(--blue-line-color);
    border-bottom: 2px solid var(--blue-line-color);

    background-image:
      linear-gradient(to right, var(--blue-line-color) 2px, transparent 2px),
      linear-gradient(to bottom, var(--blue-line-color) 2px, transparent 2px);
  }

  &--crosshair {
    border: 2px solid var(--blue-line-color);

    &::before,
    &::after {
      content: "";
      position: absolute;
      background: var(--blue-line-color);
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

@media (max-width: 768px) {
  .map-grid-overlay {
    &--gray,
    &--blue {
      --grid-size: clamp(48px, 8vmin, 96px);
      background-size: clamp(64px, 12vmin, 140px) clamp(64px, 12vmin, 140px);
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

  pre {
    margin: 0;
    padding: 1rem 0.5rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    border-radius: 0.25rem;
    background-color: #f4f4f4;
    border: solid 1px #ddd;
    font-family: "Fira Code", "Monaco", "Consolas", monospace;
    color: #333;
    line-height: 1.5;
    counter-reset: line-number;
  }

  pre .line {
    counter-increment: line-number;
    position: relative;
    padding-left: 3rem;
  }

  pre .line::before {
    content: counter(line-number);
    position: absolute;
    left: 0;
    top: 0;
    width: 2rem;
    text-align: right;
    color: #718096;
    font-size: 12px;
    padding-right: 1rem;
    border-right: 1px solid #4a5568;
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
  font:
    14px/16px Arial,
    Helvetica,
    sans-serif;
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

.pin-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
}

.delete-button {
  background-color: crimson;
  color: whitesmoke;
  padding: 0.5rem;
  font-weight: bold;
  letter-spacing: 0.03em;
}

trinity-rings-spinner {
  grid-area: 2 / 3 / 3 / 4;
}
</style>
