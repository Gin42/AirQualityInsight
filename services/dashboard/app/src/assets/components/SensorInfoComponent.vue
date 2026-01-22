<script>
import { mapGetters, mapActions } from "vuex";
import SensorCardsComponent from "./SensorCardsComponent.vue";

export default {
  name: "SensorInfoComponent",
  components: {
    SensorCardsComponent,
  },
  props: {
    sensor: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapGetters("sensors", ["allSensorsCount", "allSensors"]),

    sensorsToDisplay() {
      return this.sensor ? [this.sensor] : this.allSensors;
    },

    hasSelectedSensor() {
      return !!this.sensor;
    },
  },
  methods: {
    ...mapActions("sensors", ["deleteSensor", "modifySensor"]),

    onSelectSensor(sensor) {
      this.$emit("select-sensor", sensor);
    },
    clearSensor() {
      this.$emit("select-sensor", null);
    },
  },
  data() {
    return {
      isModify: false,
      formData: {
        name: null,
      },
    };
  },
  watch: {
    sensor: {
      immediate: true,
      handler(newSensor) {
        if (newSensor) {
          this.formData.name = newSensor.getName();
          this.isModify = false;
        } else {
          this.formData.name = null;
        }
      },
    },
  },
};
</script>

<template>
  <div class="sensor-info">
    <button class="icon-button" @click="$emit('close-info')">
      <i class="fa-solid fa-xmark"></i>
    </button>

    <div>
      <button v-if="hasSelectedSensor" class="link-button" @click="clearSensor">
        <i class="fa-solid fa-arrow-left"></i>
        Return to sensors list
      </button>
      <SensorCardsComponent
        :data="sensorsToDisplay"
        @select-sensor="onSelectSensor"
      ></SensorCardsComponent>
    </div>
  </div>
</template>

<style>
.sensor-info {
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  grid-area: 1 / 1 / 4 / 4;
  z-index: 2;
  padding: 0 1rem 1rem 1rem;
  border: 2px solid black;
  overflow: scroll;
}

.link-button {
  text-decoration: underline;
  color: darkblue;
  background-color: transparent;
  border: none;
  font-size: 1em;
  margin: 1rem 0;
}

@media (min-width: 800px) {
  .sensor-info {
    grid-area: 1 / 3 / 4 / 4;
  }
}
</style>
