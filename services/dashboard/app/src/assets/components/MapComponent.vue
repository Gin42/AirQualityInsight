<!-- components/MapComponent.vue -->
<script src="./logic/MapLogic.js"></script>
<template>
  <div class="map surface-color">
    <div class="map-container">
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
      <div class="center-marker" v-if="!loading">
        <div class="icon"></div>
      </div>
    </div>
  </div>
</template>

<style>
.cluster-average {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background-clip: padding-box;
  padding: 1.2rem;
}

.cluster-good {
  background-color: #00e400;
  border: 5px solid rgba(0, 228, 0, 0.5);
  color: black;
}
.cluster-fair {
  background-color: #feff00;
  border: 5px solid rgba(254, 255, 0, 0.5);
  color: black;
}
.cluster-moderate {
  background-color: #ff7e00;
  border: 5px solid rgba(255, 126, 0, 0.5);
  color: black;
}
.cluster-poor {
  background-color: #ff0000;
  border: 5px solid rgba(255, 0, 0, 0.5);
  color: black;
}
.cluster-very-poor {
  background-color: #8f3f97;
  border: 5px solid rgba(143, 63, 151, 0.5);
  color: black;
}
.cluster-extremely-poor {
  background-color: #7e0023;
  border: 5px solid rgba(126, 0, 35, 0.5);
  color: white;
}
.cluster-no-data {
  background-color: #b8b7b9;
  border: 5px solid rgba(184, 183, 185, 0.5);
  color: black;
}
</style>

<style scoped lang="scss">
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
  height: 100%;
  width: 100%;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: -webkit-fill-available;
  grid-area: 1 / 1 / -1 / -1;
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

.map-container {
  height: 100%;
  width: 100%;
  position: relative;

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

.loading-spinner {
  grid-area: 2 / 3 / 3 / 4;
}
</style>
