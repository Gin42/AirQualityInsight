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
import { fetchFromApi } from "@/services/api";
import McpChat from "@/assets/components/McpChat.vue";

const SearchState = Object.freeze({
  EMPTY: "empty",
  LOADING: "loading",
  FULL: "full",
});

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
    McpChat,
  },
  computed: {
    ...mapState({
      minMeasurements: (state) => state.measurements.minMeasurements,
      maxMeasurements: (state) => state.measurements.maxMeasurements,
    }),
    ...mapGetters("data", ["getMeasurementsTypes", "getThresholds"]),
    ...mapGetters("sensors", ["allSensorsCount", "allSensors"]),
    ...mapGetters("table", ["getSensorsTable"]),
    ...mapGetters("user", ["getUsername"]),
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
      searchQuery: "",
      searchState: SearchState.EMPTY,
      SearchState,
      timeout: null,
      searchSuggestions: [],
      isAddMode: false,
    };
  },
  created() {},
  methods: {
    ...mapMutations(["setSocketActive"]),
    ...mapActions("sensors", [
      "updateTimeSinceLastMeasurements",
      "updateAllStatus",
      "refreshSensors",
    ]),

    handleActiveSensors() {
      if (this.activeSensors) {
        this.updateAllStatus(false);
      } else {
        this.updateAllStatus(true);
      }
      this.activeSensors = !this.activeSensors;
    },
    handleSelectSensor(sensor) {
      this.selectedSensor = sensor;
      if (sensor) {
        this.centerMapOnSensor(sensor);
        this.showInfo();
      }
    },
    showForm({ latitude, longitude, name }) {
      if (this.isAddMode) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isFormVisible = true;
      }
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
    setSearchState(value) {
      this.searchState = value;
    },
    async submitSearchQuery(preselectedSuggestion = null) {
      try {
        if (!this.searchQuery) return;
        this.setSearchState(SearchState.LOADING);

        let geojsonData;

        if (preselectedSuggestion) {
          geojsonData = preselectedSuggestion.geojson;
        } else {
          const query = new URLSearchParams({
            q: this.searchQuery,
            polygon_geojson: 1,
            format: "json",
          }).toString();

          const response = await fetchFromApi(
            `https://nominatim.openstreetmap.org/search?${query}`,
          );

          if (!response?.length) throw "No results found";
          geojsonData = response[0].geojson;
        }

        this.$refs.mapComponent?.setSearchLayer(geojsonData);
      } catch (error) {
        console.error("Search failed:", error);
        this.setSearchState(SearchState.EMPTY);
      } finally {
        this.setSearchState(SearchState.FULL);
      }
    },
    clearSearch() {
      this.$refs.mapComponent?.clearSearchLayer();
      this.setSearchState(SearchState.EMPTY);
    },

    rankSuggestion(s, queryLength) {
      let score = 0;

      if (typeof s.place_rank === "number") {
        score += (30 - s.place_rank) * 10;
      }

      switch (s.class) {
        case "boundary": // country / region
          score += 200;
          break;
        case "place": // city / town / village
          score += 150;
          break;
        case "highway": // streets
          score += 50;
          break;
        case "amenity": // POI
          score += 0;
          break;
        default:
          score += 10;
      }

      score += (s.importance || 0) * 100;

      if (queryLength <= 3 && s.place_rank <= 16) {
        score += 150;
      }

      return score;
    },

    async getSuggestions() {
      if (!this.searchQuery || this.searchQuery.length < 3) {
        this.searchSuggestions = [];
        return;
      }

      const currentQuery = this.searchQuery;

      const limit = 20;

      const query = new URLSearchParams({
        q: this.searchQuery,
        format: "json",
        addressdetails: 1,
        limit: limit,
      }).toString();

      try {
        const response = await fetchFromApi(
          `https://nominatim.openstreetmap.org/search?${query}`,
        );

        if (this.searchQuery === currentQuery) {
          this.searchSuggestions =
            response
              .map((s) => ({
                ...s,
                _score: this.rankSuggestion(s, this.searchQuery.length),
              }))
              .sort((a, b) => b._score - a._score)
              .slice(0, limit) || [];
        }
      } catch (error) {
        console.error("Unable to fetch suggestions:", error);
      }
    },
    onSearchInput() {
      if (this.searchState === this.SearchState.FULL) {
        this.setSearchState(this.SearchState.EMPTY);
      }
      /*clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.getSuggestions();
      }, 300);*/
    },

    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.display_name;
      this.searchSuggestions = [];
      this.submitSearchQuery(suggestion);
    },

    onSearchAction() {
      switch (this.searchState) {
        case this.SearchState.EMPTY:
          this.submitSearchQuery();
          break;

        case this.SearchState.FULL:
          this.clearSearch();
          break;

        case this.SearchState.LOADING:
          break;
      }
    },

    onToggleMapMode(event) {
      this.isAddMode = event.target.checked;
    },
  },
};
</script>

<template>
  <!-- Main element: should contain settings, map and sensor info if selected -->
  <div class="dashboard-component map-component-container">
    <div class="search-container bg-color">
      <form @submit.prevent="onSearchAction" class="search-form">
        <input
          type="text"
          placeholder="Search..."
          name="search"
          v-model="searchQuery"
          @input="onSearchInput"
          autocomplete="off"
          class="bg-color"
        />
        <button type="submit" class="btn tertiary-color search-button">
          <i class="fa fa-search" v-if="searchState === SearchState.EMPTY"> </i>
          <i class="fa-solid fa-x" v-if="searchState === SearchState.FULL"></i>
          <i
            class="fa-solid fa-circle-notch"
            v-if="searchState === SearchState.LOADING"
          ></i>
        </button>
      </form>
      <!--
      Da discuterne con kelvin perchè nominatim non nasce ed è sconsigliato/proibito 
      fare autocompletition, e i suggerimenti che da non sono particolarmente buoni. 
      Potrei usare altri API o sistemi come photon e pelias, ma prima facciamo che ho
      tutte le funzionalità e poi faccio roba in più
      <ul
        v-if="this.searchSuggestions.length"
        class="search-suggestions bg-color"
      >
        <li
          v-for="(s, index) in this.searchSuggestions"
          :key="index"
          @click="selectSuggestion(s)"
          class="bg-color"
        >
          <i class="fa-solid fa-earth-americas" v-if="s.place_rank <= 3"></i>
          <i
            class="fa-solid fa-flag"
            v-if="s.place_rank >= 4 && s.place_rank <= 12"
          ></i>
          <i
            class="fa-solid fa-city"
            v-if="s.place_rank >= 13 && s.place_rank <= 20"
          ></i>
          <i class="fa-solid fa-location-dot" v-if="s.place_rank >= 21"></i>
          <p>{{ s.display_name }}</p>
        </li>
        
      </ul>-->
    </div>

    <div class="component-header-buttons" v-if="!isLoading">
      <div class="btn mode-switch" v-if="getUsername != null">
        <label class="map-switch" @click.stop>
          <input
            type="checkbox"
            v-model="isAddMode"
            @click="onToggleMapMode($event)"
            class="map-mode-input"
          />
          <span class="map-track">
            <span class="map-option option-view">
              <i class="fa-solid fa-eye"></i>
              <span>View</span>
            </span>
            <span class="map-option option-edit">
              <i class="fa-solid fa-pencil"></i>
              <span>Edit</span>
            </span>
            <span class="map-active-bg"></span>
          </span>
        </label>
      </div>

      <!-- Refresh and stop buttons -->
      <button @click="refreshSensors" class="btn tertiary-color">
        <i class="fas fa-sync-alt"></i> Refresh
      </button>
      <button
        @click="handleActiveSensors"
        class="btn tertiary-color"
        v-if="getUsername != null"
      >
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
      :add-mode="isAddMode"
      @marker-click="handleSelectSensor"
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
        @select-sensor="handleSelectSensor"
        :sensor="selectedSensor"
        :selected="!!selectedSensor"
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

    <McpChat v-if="getUsername != null"></McpChat>
  </div>
</template>

<style lang="scss">
.search-container {
  grid-area: 1/2/2/3;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  border-radius: 50px;
  border: 1.5px solid black;
  padding: 0 0.5rem;
  margin-top: 1rem;

  .search-form {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 0.5rem;

    input {
      width: 100%;
      border: none;
      font-size: 1em;
      outline: none;
    }

    button {
      border-radius: 50px;
      color: white;
      aspect-ratio: 1 / 1;
    }
  }
}

.search-suggestions {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: none;
  max-height: 13rem;
  overflow-y: auto;
  background: --bg-color;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 13rem;

  p {
    margin: 0;
  }
}

.search-suggestions li {
  display: flex;
  flex-direction: row;
  cursor: pointer;
  padding: 0.5rem 1rem;
  background: --bg-color;
}

.search-suggestions li:hover {
  background: #f0f0f0;
}

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

.fa-search {
  color: var(--background-color);
}

.map-switch {
  position: relative;
  display: inline-block;
  width: 140px; // slightly wider for comfort
  height: 40px; // taller for better spacing

  input.map-mode-input {
    display: none; // hide checkbox
  }

  .map-track {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: var(--surface-color); // track
    border-radius: 8px;
    display: flex;
    overflow: hidden;

    .map-option {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2; // text above active-bg
      font-weight: 600;
      color: #333;
      cursor: pointer;

      transition: color 0.3s;
      gap: 0.2rem;
    }

    .map-active-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 50%; // exactly half of the track
      height: 100%;
      background-color: var(--tertiary-color);
      border-radius: 8px;
      z-index: 1; // behind text
      transition: left 0.3s;
    }
  }

  input.map-mode-input:checked ~ .map-track .map-active-bg {
    left: 50%; // move to the second half
  }

  input.map-mode-input:checked ~ .map-track .option-edit {
    color: #fff;
  }

  input.map-mode-input:not(:checked) ~ .map-track .option-view {
    color: #fff;
  }
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
