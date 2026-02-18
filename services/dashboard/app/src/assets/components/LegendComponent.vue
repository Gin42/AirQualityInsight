<template>
  <button ref="legendButton" class="legend-button btn tertiary-color">
    <i class="fa-solid fa-circle-info info-button"></i>
  </button>

  <!-- Hidden content used by Tippy -->
  <div ref="legendContent" class="map-legend map-legend-tooltip">
    <div
      v-for="(threshold, key) in getThresholds"
      :key="key"
      class="legend-item"
    >
      <div class="color-circle" :class="`circle-${key}`"></div>
      <p>{{ threshold.label }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

export default {
  name: "LegendComponent",

  computed: {
    ...mapGetters("data", ["getThresholds"]),
  },

  mounted() {
    this.tippyInstance = tippy(this.$refs.legendButton, {
      content: this.$refs.legendContent,
      allowHTML: true,
      interactive: true,
      trigger: "click",
      placement: "bottom-start",
      theme: "legend-theme",
    });
  },

  beforeUnmount() {
    if (this.tippyInstance) {
      this.tippyInstance.destroy();
    }
  },
};
</script>

<style lang="scss">
i.info-button {
  font-size: 1em !important;
}

.tippy-box[data-theme~="legend-theme"] {
  background-color: var(--surface-color);
  color: inherit;
  border-radius: 8px;
  border: 1px solid black;
  padding: 0;
}

.tippy-box[data-theme~="legend-theme"] .tippy-content {
  padding: 0.5rem;
}

.map-legend {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  align-items: flex-start;
  z-index: 1;
  height: fit-content;
  justify-self: start;
  align-self: end;
  padding: 0.5rem;
}

.map-legend-tooltip {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.5rem;
  width: max-content;
}

.legend-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;

  p {
    margin: 0;
  }
}

.color-circle {
  width: 0.8rem;
  aspect-ratio: 1/1;
  border-radius: 50%;
  margin-bottom: 0.1rem;
}

.circle-good {
  background-color: var(--AQI-good);
}
.circle-fair {
  background-color: var(--AQI-fair);
}
.circle-moderate {
  background-color: var(--AQI-moderate);
}
.circle-poor {
  background-color: var(--AQI-poor);
}
.circle-very_poor {
  background-color: var(--AQI-very-poor);
}
.circle-extremely_poor {
  background-color: var(--AQI-extremely-poor);
}

@media (min-width: 420px) {
  .map-legend {
    width: fit-content;
    margin-left: 0.3rem;
  }
}
</style>
