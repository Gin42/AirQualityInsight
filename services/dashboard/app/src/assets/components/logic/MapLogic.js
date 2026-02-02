import L from "leaflet";
import { mapState, mapGetters, mapMutations } from "vuex";
import pushpinSvg from "@/assets/pushpin.svg";

import { createLeafletMap } from "@/maps/leafletMap";
import { createSensorMarkers } from "@/maps/sensorMarkers";
import { buildHeatmapPoints } from "@/maps/heatmapManager";
import { reverseGeocode } from "@/services/geocoding";

export default {
  name: "MapComponent",
  props: { loading: Boolean },

  computed: {
    ...mapState({
      center: (s) => s.map.center,
      zoom: (s) => s.map.zoom,
    }),
    ...mapGetters("measurements", ["lastMeasurement", "getMeasurementsTypes"]),
    ...mapGetters("sensors", ["allSensors", "getSensor"]),
    ...mapGetters("stats", ["getIntensity"]),
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
    };
  },

  watch: {
    allSensors: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (!this.markers) return;
        this.markers.sync(newVal, this.prevSensors);
        this.prevSensors = [...newVal];
      },
    },

    lastMeasurement(data) {
      if (!data) return;
      const sensor = this.getSensor(data.sensor_id);
      if (!sensor) return;

      const points = buildHeatmapPoints({
        data,
        sensor,
        measurementTypes: this.getMeasurementsTypes,
        selectedMeasurement: this.$store.state.map.selectedMeasurement,
        getIntensity: this.getIntensity,
      });

      this.leaflet.updateHeatmap(points);
    },
  },

  methods: {
    ...mapMutations("map", ["setCenter", "setZoom"]),

    async onMapClick(e) {
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

    this.markers = createSensorMarkers(map, this.pushpinIcon, (sensor) =>
      this.$emit("marker-click", sensor),
    );
  },
};
