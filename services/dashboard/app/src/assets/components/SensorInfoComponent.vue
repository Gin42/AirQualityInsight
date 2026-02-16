<script>
import { mapGetters, mapActions } from "vuex";
import SensorCardsComponent from "./SensorCardsComponent.vue";

const SearchState = Object.freeze({
  EMPTY: "empty",
  FULL: "full",
});

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
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters("sensors", ["allSensorsCount", "allSensors"]),

    sensorsToDisplay() {
      let sensors = this.sensor ? [this.sensor] : this.allSensors;

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        sensors = sensors.filter((s) => s.getName().toLowerCase().includes(q));
      }

      return sensors;
    },

    setSearchState(value) {
      this.searchState = value;
    },

    onSearchAction() {
      switch (this.searchState) {
        case this.SearchState.EMPTY:
          this.setSearchState(SearchState.FULL);
          break;

        case this.SearchState.FULL:
          this.setSearchState(SearchState.EMPTY);
          this.searchQuery = "";
          break;
      }
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
      searchQuery: "",
      searchState: SearchState.EMPTY,
      SearchState,
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
  <div class="sensor-info surface-color">
    <button class="icon-button" @click="$emit('close-info')">
      <i class="fa-solid fa-xmark"></i>
    </button>

    <div>
      <button v-if="selected" class="link-button" @click="clearSensor">
        <i class="fa-solid fa-arrow-left"></i>
        Return to sensors list
      </button>

      <div class="search-container bg-color sensor-search" v-if="!selected">
        <form @submit.prevent="onSearchAction" class="search-form">
          <input
            type="text"
            placeholder="Search for a sensor"
            name="search"
            v-model="searchQuery"
            autocomplete="off"
            class="bg-color"
          />
          <button type="submit" class="btn tertiary-color">
            <i class="fa fa-search" v-if="searchState === SearchState.EMPTY">
            </i>
            <i
              class="fa-solid fa-x"
              v-if="searchState === SearchState.FULL"
            ></i>
          </button>
        </form>
      </div>

      <SensorCardsComponent
        :data="sensorsToDisplay"
        :selected="selected"
        @select-sensor="onSelectSensor"
        @delete-sensor="clearSensor"
      ></SensorCardsComponent>
    </div>
  </div>
</template>

<style>
.sensor-search {
  margin-bottom: 1rem;
}

.sensor-info {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 1 / 4 / 4;
  z-index: 2;
  padding: 0 1rem 1rem 1rem;
  overflow-y: scroll;
  border-radius: 8px;
  margin-left: 1rem;
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
