import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import { mapState, mapMutations, mapActions, mapGetters } from "vuex";
import pushpinSvg from "@/assets/pushpin.svg";
import pushpinHomeSvg from "@/assets/pushpinVector.svg";
import { fetchFromApi } from "@/services/api";

export default {
  name: "MapComponent",
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState({
      minMeasurements: (state) => state.measurements.minMeasurements,
      maxMeasurements: (state) => state.measurements.maxMeasurements,
      center: (state) => state.map.center,
      newMeasurement: (state) => state.measurements.measurements,
      currentMeasurements: (state) => state.measurements.currentMeasurements,
      zoom: (state) => state.map.zoom,
      selectedMeasurement: (state) => state.map.selectedMeasurement,
      gridType: (state) => state.map.gridType,
      currentCoords: (state) => state.map.currentCoords,
    }),
    ...mapGetters("measurements", [
      "lastMeasurement",
      "allMeasurementsCount",
      "allMeasurements",
    ]),
    ...mapGetters("sensors", ["getSensor", "allSensorsCount", "allSensors"]),
    ...mapGetters("socket", ["isSocketConnected", "isServerReady"]),
    ...mapGetters("data", ["getMeasurementsTypes", "getThresholds"]),
    sensorSignature() {
      return this.allSensors.map((s) => ({
        id: s.sensor_id,
        lat: s.lat,
        lng: s.lng,
        name: s.name,
        active: s.active,
      }));
    },
  },
  watch: {
    sensorSignature: {
      handler(newSig, oldSig = []) {
        if (!this.map) return;

        this.syncSensorsOnMap(this.allSensors, this._prevSensors || []);
        this._prevSensors = [...this.allSensors];
      },
      deep: true,
      immediate: true,
    },
    allMeasurements: {
      handler() {
        if (!this.map || !this.lastMeasurement) return;

        this.registerNewMeasurement(this.lastMeasurement);
      },
      deep: true,
      immediate: false,
    },
  },
  data() {
    return {
      map: null,
      heatLayer: null,
      searchLayer: null,
      error: false,
      pushpinIcon: L.icon({
        iconUrl: pushpinSvg,
        iconSize: [24, 24],
        iconAnchor: [12, 20],
      }),
      searchQuery: "",
      zoomThreshold: 14,
    };
  },
  methods: {
    ...mapMutations("map", ["setCenter", "setZoom", "setCurrentCoords"]),
    ...mapActions("sensors", ["updateLastMeasurement"]),
    ...mapActions("stats", ["getIntensity"]),

    syncSensorsOnMap(newSensors, oldSensors) {
      console.log("The newst ferrari on the market", newSensors, oldSensors);

      const newMap = new Map(newSensors.map((s) => [s.sensor_id, s]));

      const oldMap = new Map(oldSensors.map((s) => [s.sensor_id, s]));

      for (const [id, sensor] of newMap.entries()) {
        if (!oldMap.has(id)) {
          this.addSensorMarker(sensor);
        } else {
          this.updateSensorMarker(sensor);
        }
      }
      for (const [id, sensor] of oldMap.entries()) {
        if (!newMap.has(id)) {
          this.removeSensorMarker(sensor);
        }
      }
    },

    addSensorMarker(sensor) {
      if (sensor.getMarker()) return;

      const marker = L.marker([sensor.getLat(), sensor.getLng()], {
        icon: this.pushpinIcon,
      });

      marker.addTo(this.map);

      marker.on("click", () => {
        this.$emit("marker-click", sensor);
      });

      sensor.setMarker(marker);
    },

    updateSensorMarker(sensor) {
      /** se mi serve per la heat map è qui */
    },

    removeSensorMarker(sensor) {
      const marker = sensor.getMarker();
      if (!marker) return;

      marker.remove();
      sensor.setMarker(null);
    },

    initMap() {
      // Leaflet's interactive map
      try {
        this.map = L.map("map").setView(
          [this.center.lat, this.center.lng],
          this.zoom,
        );
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }

      // OpenStreetMap's layer
      const tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        },
      );

      tileLayer.addTo(this.map);

      tileLayer.once("load", () => {
        this.$emit("loading-change", false);
      });

      const pushpinHomeIcon = L.icon({
        //da colorare pushpinVectorHome
        iconUrl: pushpinHomeSvg,
        iconSize: [24, 24],
        iconAnchor: [12, 20],
        popupAnchor: [0, -20],
      });
      const homeMarker = L.marker([this.center.lat, this.center.lng], {
        icon: pushpinHomeIcon,
      });
      homeMarker.bindPopup(`Center of the map: “${this.center.name}”`);
      homeMarker.addTo(this.map);

      const updateCurrentCoordinates = () => {
        const newCenter = this.map.getCenter();

        const coords = {
          lng: parseFloat(newCenter.lng.toFixed(7)),
          lat: parseFloat(newCenter.lat.toFixed(7)),
        };

        this.setCurrentCoords(coords);
      };

      updateCurrentCoordinates();

      // Update map's coordinates on move
      this.map.on("moveend", () => {
        updateCurrentCoordinates();
        const lng = this.currentCoords.lng;
        const lat = this.currentCoords.lat;

        this.setCenter({ lng, lat });
        this.setZoom(this.map.getZoom());
      });

      // Leaflet caches on the parent container may result in a misaligned center
      this.map.whenReady(() => {
        setTimeout(() => {
          this.map.invalidateSize();
        }, 100);
      });
      window.addEventListener("resize", () => {
        this.map.invalidateSize();
      });

      const gradient = {};
      for (const threshold of Object.values(this.getThresholds)) {
        gradient[threshold.value] = threshold.color;
      }

      this.heatLayer = L.heatLayer([], {
        gradient,
        radius: 30, // radius of each “point” in pixels
        blur: 25, // how blurry each point is
        maxZoom: 18, // max zoom where heat intensity scales
        minOpacity: 0.3,
        max: 1.0, // maximum intensity
      }).addTo(this.map);

      this.map.on("click", async (e) => {
        const longitude = Number(e.latlng.lng.toFixed(7));
        const latitude = Number(e.latlng.lat.toFixed(7));

        let address = await this.fetchAddressFromAPI(latitude, longitude);

        console.log("address: " + address);
        this.$emit("open-form", {
          longitude: longitude,
          latitude: latitude,
          name: address,
        });
      });
    },

    async fetchAddressFromAPI(lat, lng) {
      try {
        const params = "format=json";
        const response = await fetchFromApi(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&${params}`,
        );

        const { road, house_number, city, country } = response.address;

        const addressParts = [road, city, house_number, country].filter(
          Boolean,
        );
        return addressParts.join(", ");
      } catch (error) {
        console.error("Unable to fetch address from API:", error);
      }
    },

    setSearchLayer(data) {
      this.searchLayer = L.geoJSON(data, {
        style: {
          color: "#3590f3",
          weight: 2,
          fillColor: "#8fb8ed",
          fillOpacity: 0.2,
        },
      }).addTo(this.map);

      this.map.flyToBounds(this.searchLayer.getBounds(), {
        duration: 1.5,
      });
    },

    clearSearchLayer() {
      if (this.searchLayer) {
        this.map.removeLayer(this.searchLayer);
        this.searchLayer = null;
      }
    },

    registerNewMeasurement(data) {
      if (!data || !data.sensor_id) return;

      const id = data.sensor_id;

      const sensor = this.getSensor(id);
      if (!sensor) return;

      let measurements = this.getMeasurementsTypes;

      for (const measurementType of Object.keys(measurements)) {
        const intensity = this.getIntensity({
          concentration: data[measurementType],
          pollutant: measurementType,
        });

        console.log("This is getting a little intense:", intensity);

        const latLng = [sensor.lat, sensor.lng, intensity.value];

        measurements[measurementType].heatLatLng.unshift(latLng);
        if (
          measurements[measurementType].heatLatLng.length >
          this.currentMeasurements
        ) {
          measurements[measurementType].heatLatLng = measurements[
            measurementType
          ].heatLatLng.slice(0, this.currentMeasurements);
        }
      }

      this.updateHeatmap(measurements[this.selectedMeasurement].heatLatLng);
    },

    updateHeatmap(heatLatLng) {
      this.heatLayer.setLatLngs(heatLatLng);
    },

    centerOnLocation(lat, lng, zoom = 16) {
      if (!this.map) throw "Map not initialized";

      this.map.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.5, // sec
      });
    },

    clearMeasurements() {
      //to-do
      const count =
        this.measurements[this.selectedMeasurement].heatLatLng.length;
      for (const measurementType of Object.keys(this.measurements))
        this.measurements[measurementType].heatLatLng = [];
      this.updateHeatmap();
      this.$emit("measurements-cleared", count);
    },
  },
  async mounted() {
    this.$emit("loading-change", true);
    while (!this.isSocketConnected || !this.isServerReady) {
      await new Promise((r) => setTimeout(r, 100));
    }

    this.initMap();

    this.$nextTick(() => {
      this.syncSensorsOnMap(this.allSensors, []);
    });
  },
};
