import L from "leaflet";
import { mapState, mapGetters, mapMutations } from "vuex";
import pushpinSvg from "@/assets/icons/pushpin.svg";

import { createLeafletMap } from "./map/useLeafletMap";
import { createSensorMarkers } from "./map/sensorMarkers";
import { createHeatMap } from "./map/heatmapManager";
import { reverseGeocode } from "./map/geocoding";

export default {
  name: "MapComponent",
  props: { loading: Boolean, addMode: Boolean },

  computed: {
    ...mapState({
      center: (s) => s.map.center,
      zoom: (s) => s.map.zoom,
      selectedMeasurement: (s) => s.map.selectedMeasurement,
      gridType: (state) => state.map.gridType,
    }),
    ...mapGetters("measurements", ["lastMeasurement"]),
    ...mapGetters("data", ["getMeasurementsTypes"]),
    ...mapGetters("sensors", ["allSensors", "getSensor"]),
    ...mapGetters("stats", ["getIntensity"]),
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

  data() {
    return {
      leaflet: null,
      markers: null,
      pushpinIcon: L.icon({
        iconUrl: pushpinSvg,
        iconSize: [24, 24],
        iconAnchor: [12, 20],
      }),
      prevSensors: [],
      heatmapManager: null,
      geoData: null,
    };
  },
  watch: {
    sensorSignature: {
      immediate: true,
      deep: true,
      handler(newSig, oldSig = []) {
        if (!this.markers || !this.leaflet) return;

        if (newSig.length === 0) {
          this.markers.clear();
          this._prevSensors = [];
          this.leaflet.updateHeatmap([]);
          /** Da controllare con Kelvin:
           * Al momento se viene richiesto il refresh dei sensori
           * L'icon del cluster non viene ricalcolata fino a che non
           * avviene una misurazione ed ignora quindi le
           * misurazioni già presenti.
           * Potrebbe essere una migliore idea mettere nel cluster
           * semplicemente il conto di quanti sensori sono al suo interno
           */
          return;
        }

        this.markers.sync(this.allSensors, this._prevSensors || []);
        this._prevSensors = [...this.allSensors];
      },
    },

    lastMeasurement(data) {
      if (!data) return;
      const sensor = this.getSensor(data.sensor_id);
      if (!sensor) return;

      const points = this.heatmapManager.buildHeatmapPoints({
        data,
        sensor,
        measurementTypes: this.getMeasurementsTypes,
        selectedMeasurement: this.selectedMeasurement,
        getIntensity: this.getIntensity,
      });

      this.leaflet.updateHeatmap(points);
      this.markers.refresh();
    },
    selectedMeasurement(newVal) {
      if (!this.heatmapManager || !this.leaflet) return;

      const points = this.heatmapManager.changeHeatmapPoints({
        measurementTypes: this.getMeasurementsTypes,
        selectedMeasurement: newVal,
      });
      this.leaflet.updateHeatmap(points);
      this.markers.refresh();
    },

    "$route.query.sensorId": {
      immediate: true,
      handler(newId) {
        if (!newId) return;

        const sensor = this.getSensor(newId);
        if (!sensor || !this.leaflet) return;

        this.centerOnLocation(sensor.lat, sensor.lng, this.zoom);
        this.$emit("marker-click", sensor);
      },
    },
  },
  methods: {
    ...mapMutations("map", ["setCenter", "setZoom"]),

    centerOnLocation(lat, lng, zoom = 16) {
      if (!this.leaflet) return;
      this.leaflet.centerOnLocation(lat, lng, zoom);
    },

    setSearchLayer(data) {
      this.leaflet.setSearchLayer(data);
    },

    clearSearchLayer() {
      this.leaflet.clearSearchLayer();
    },

    async onMapClick(e) {
      if (!this.addMode) return;
      const lat = +e.latlng.lat.toFixed(7);
      const lng = +e.latlng.lng.toFixed(7);
      const name = await reverseGeocode(lat, lng);

      this.$emit("open-form", { latitude: lat, longitude: lng, name });
    },
  },

  async mounted() {
    this.leaflet = createLeafletMap();

    const map = this.leaflet.init("map", this.center, this.zoom, () =>
      this.$emit("loading-change", false),
    );

    map.on("click", this.onMapClick);

    this.$watch("addMode", (addMode) => {
      map.getContainer().style.cursor = addMode ? "crosshair" : "grab";
    });

    this.heatmapManager = createHeatMap();

    this.markers = createSensorMarkers(
      map,
      this.pushpinIcon,
      (sensor) => this.$emit("marker-click", sensor),
      () => this.$store.state.map.selectedMeasurement,
      this.getIntensity,
      this.heatmapManager.clearHeatMapOfSensor,
    );

    this.markers.sync(this.allSensors, []);
    this._prevSensors = [...this.allSensors];

    const route = this.$route;

    if (route.query.sensorId) {
      const sensor = this.getSensor(route.query.sensorId);

      if (sensor) {
        this.centerOnLocation(sensor.lat, sensor.lng, this.zoom);
        this.$emit("marker-click", sensor);
      }
    }
  },
  beforeUnmount() {
    for (const sensor of this.allSensors) {
      sensor.setMarker(null);
    }

    if (this.markers) {
      this.markers.clear();
      this.markers = null;
    }

    if (this.leaflet?.map) {
      this.leaflet.map.off();
      this.leaflet.map.remove();
    }

    this.leaflet = null;
    this._prevSensors = [];
  },
};
