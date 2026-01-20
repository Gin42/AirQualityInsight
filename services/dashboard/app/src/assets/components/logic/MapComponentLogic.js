import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import { computed, ref } from "vue";
import { mapState, mapActions, mapGetters } from "vuex";
import pushpinSvg from "@/assets/pushpin.svg";
import pushpinHomeSvg from "@/assets/pushpinVector.svg";
import { loadConfigFromFile } from "vite";

export default {
  name: "MapComponent",
  computed: {
    ...mapState({
      center: (state) => state.center,
    }),
  },
  props: {
    measurements: {
      type: Object,
      default: () => ({
        voc: [],
        co2: [],
        pm25: [],
        pm10: [],
        no2: [],
        o3: [],
        so2: [],
        temperature: [],
        humidity: [],
        pressure: [],
      }),
    },
    minMeasurements: {
      type: Number,
      required: true,
    },
    maxMeasurements: {
      type: Number,
      required: true,
    },
    getIntensity: {
      type: Function,
      required: true,
    },
    thresholds: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      zoom: ref(13),
      map: null,
      heatLayer: null,
      selectedMeasurement: "pm25",
      maxHeatLatLng: 250,
      error: false,
      show: {
        sensorLocations: true,
        postalCodeBoundaries: false,
        neighborhoods: false,
        zones: false,
        ztl: false,
      },
      data: {
        sensorLocations: [],
        postalCodeBoundaries: [],
        neighborhoods: [],
        zones: [],
        ztl: [],
      },
      layers: {
        sensorLocations: [],
        postalCodeBoundaries: [],
        neighborhoods: [],
        zones: [],
        ztl: [],
      },
      gridType: "none",
      isHovered: ref(false),
      isPinned: ref(false),
      loading: ref(true),
    };
  },
  methods: {
    ...mapMutations(["setCenter"]),

    ...mapActions("sensors", ["fetchSensors"], { root: true }),

    async loadData(filename) {
      this.loading = true;

      try {
        const path = `/data/${filename}`;
        const response = await fetch(path);
        if (!response.ok) throw new Error("Failed to load data");
        return response.json();
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    // Initialization of OpenStreetMap's map, using Leaflet
    initMap() {
      // Leaflet's interactive map
      this.map = L.map("map").setView(
        [this.center.lat, this.center.lng],
        this.zoom
      );
      // OpenStreetMap's layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.map);

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

      let currentLat, currentLng;

      const updateCurrentCoordinates = () => {
        const newCenter = this.map.getCenter();
        currentLat = newCenter.lat.toFixed(7);
        currentLng = newCenter.lng.toFixed(7);
      };

      updateCurrentCoordinates();

      // Update map's coordinates on move
      this.map.on("moveend", () => {
        updateCurrentCoordinates();
        this.setCenter(currentLng, currentLat);
        this.zoom = this.map.getZoom();
      });

      const coordinatesCopyBtn = document.getElementById(
        "coordinates-copy-btn"
      );
      if (!coordinatesCopyBtn) return;

      coordinatesCopyBtn.addEventListener("click", () => {
        const coordText = `${currentLat}\t${currentLng}`;

        navigator.clipboard
          .writeText(coordText)
          .then(() => {
            // Visual feedback that copying has occurred
            const btn = coordinatesCopyBtn;
            const originalText = btn.textContent;
            btn.textContent = "Copied!";
            btn.classList.add("copied");

            // Restore original text after 1.5 seconds
            setTimeout(() => {
              btn.textContent = originalText;
              btn.classList.remove("copied");
            }, 1.5 * 1000); // ms
          })
          .catch((err) => {
            console.error("Error copying coordinates: ", err);
            alert("Could not copy coordinates. Try doing it manually.");
          });
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
      for (const threshold of Object.values(this.thresholds))
        gradient[threshold.value] = threshold.color;

      this.heatLayer = L.heatLayer([], {
        radius: 30,
        blur: 25,
        maxZoom: 17,
        gradient,
      }).addTo(this.map);

      //se clicco sulla mappa posso aggiungere un pin nell coordinate selezionate
      /*this.map.on("click", async (e) => {
        const longitude = e.latlng.lng;
        const latitude = e.latlng.lat;
        let address = await this.fetchAddressFromAPI(latitude, longitude);

        console.log("address: " + address);
        this.$emit("open-form", {
          longitude: longitude,
          latitude: latitude,
          address: address,
        });
      });*/
    },
    async fetchAddressFromAPI(lat, lng) {
      try {
        const params = "format=json";
        const jsonResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&${params}`
        );
        if (!jsonResponse.ok) {
          throw new Error(`HTTP error! status: ${jsonResponse.status}`);
        }

        const response = await jsonResponse.json();

        if (!response) {
          throw new Error("API request failed");
        }

        console.log(response);

        const { road, house_number, city, country } = response.address;

        // Assemble the address string, checking for undefined values
        const addressParts = [road, city, house_number, country].filter(
          Boolean
        ); // Filter out any undefined parts

        return addressParts.join(", ");
      } catch (error) {
        console.error("Unable to fetch sensors from API:", error);
      }
    },
    toggleLayer(layer, hideOrEvent = false) {
      const hide = hideOrEvent instanceof Event ? false : hideOrEvent;

      this.show[layer] = !this.show[layer];
      if (hide) this.show[layer] = false;

      const exclusiveGroups = {
        postalCodeBoundaries: ["neighborhoods", "zones", "ztl"],
        neighborhoods: ["postalCodeBoundaries", "zones", "ztl"],
        zones: ["postalCodeBoundaries", "neighborhoods", "ztl"],
        ztl: [
          "neighborhoods",
          "zones",
          "postalCodeBoundaries",
          "neighborhoods",
        ],
      };

      if (this.show[layer]) {
        this.drawLayer(layer);
        if (exclusiveGroups[layer])
          for (const otherLayer of exclusiveGroups[layer])
            this.toggleLayer(otherLayer, true);
      } else this.clearLayer(layer);
    },
    clearLayer(layer) {
      for (const l of this.layers[layer]) if (this.map) this.map.removeLayer(l);

      this.layers[layer] = [];
    },
    registerNewMeasurement(data) {
      if (!this.data.sensorLocations?.size) return;

      const sensor = this.data.sensorLocations.get(data.name);
      if (!sensor) return;

      this.highlightSensor(sensor);

      for (const measurementType of Object.keys(this.measurements)) {
        const intensity = this.getIntensity(
          data[measurementType],
          measurementType
        );

        const latLng = [sensor.lat, sensor.lng, intensity.value];
        this.measurements[measurementType].heatLatLng.unshift(latLng);
        if (
          this.measurements[measurementType].heatLatLng.length >
          this.maxHeatLatLng
        )
          this.measurements[measurementType].heatLatLng = this.measurements[
            measurementType
          ].heatLatLng.slice(0, this.maxHeatLatLng);
      }
      this.updateHeatmap();
    },
    updateHeatmap() {
      this.heatLayer.setLatLngs(
        this.measurements[this.selectedMeasurement].heatLatLng
      );
    },
    highlightSensor(sensor) {
      sensor.marker?.setOpacity(0.75);
      setTimeout(() => {
        sensor.marker?.setOpacity(1);
      }, 250);
    },
    async populateLayer(layer) {
      const dataFile = {
        sensorLocations: null,
        postalCodeBoundaries: "caps.geojson",
        neighborhoods: "neighborhoods.geojson",
        zones: "zones.geojson",
        ztl: "ztl.geojson",
      };

      let data;

      if ("sensorLocations" === layer) {
        data = await this.fetchSensors();
        this.$emit("sensors-loaded", sensors);
        if (!data) throw "Data not provided";
        this.data[layer] = data;
      } else {
        data = await this.loadData(dataFile[layer]);
        if (!data) throw "Data not provided";
        this.data[layer] = data.features;
      }
    },
    async refreshSensorData() {
      this.data.sensorLocations = null;
      const data = await this.fetchSensorData();
      if (!data) throw "Data not provided";
      this.data.sensorLocations = data;
      this.drawLayer("sensorLocations");
    },
    async drawLayer(layer) {
      if (!this.data[layer]) return console.error("Data not provided");
      const pushpinIcon = L.icon({
        iconUrl: pushpinSvg,
        iconSize: [24, 24],
        iconAnchor: [12, 20],
        popupAnchor: [0, -20],
      });

      if ("sensorLocations" === layer) {
        for (const sensorLocation of this.data[layer].values()) {
          const marker = L.marker([sensorLocation.lat, sensorLocation.lng], {
            icon: pushpinIcon,
          });
          if (sensorLocation.desc) marker.bindPopup(sensorLocation.desc);
          marker.addTo(this.map);
          marker.on("click", () => {
            this.$emit("marker-click", sensorLocation);
          });

          this.layers[layer].push(marker);
          sensorLocation.marker = marker;
        }
        return;
      }

      this.clearLayer(layer);

      let geojsonLayer;

      const highlightFeature = (feature, layer) => {
        if (!feature.properties) return;

        const value = feature.properties[config.propertyKey];
        const displayValue = config.displayKey
          ? feature.properties[config.displayKey]
          : value;

        layer
          .bindPopup(`<b>${config.labelKey}:</b> ${displayValue}`)
          .openPopup();

        layer.setStyle({
          color: getColor(value),
          weight: 3,
          opacity: 1,
          fillColor: getColor(value),
          fillOpacity: 0.5,
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge)
          layer.bringToFront();
      };

      const createStyle = (feature) => {
        const value = feature.properties[config.propertyKey];
        return {
          color: getColor(value),
          weight: 2,
          opacity: 0.5,
          fillColor: getColor(value),
          fillOpacity: 0.2,
        };
      };

      const pointToLayer = (feature, lat_lng) => {
        const value = feature.properties[config.propertyKey];
        return L.circleMarker(lat_lng, {
          radius: 8,
          color: "#000",
          weight: 3,
          opacity: 1,
          fillColor: getColor(value),
          fillOpacity: 0.5,
        });
      };
      const colors = this.getOrangeColorPalette();
      const config = this.getLayerConfig(layer, colors);
      const getColor = (value) => {
        return config.colorMap[value] || colors.baseOrange;
      };

      const resetFeatureStyle = (layer) => {
        geojsonLayer.resetStyle(layer);
      };

      function onEachFeature(feature, layer) {
        layer.on({
          mouseover: () => highlightFeature(feature, layer),
          mouseout: () => resetFeatureStyle(layer),
          click: () => highlightFeature(feature, layer),
        });
      }

      for (const feature of this.data[layer]) {
        geojsonLayer = L.geoJSON(feature, {
          style: createStyle,
          pointToLayer,
          onEachFeature,
        }).addTo(this.map);

        this.layers[layer].push(geojsonLayer);
      }
    },
    getDisplayName(key) {
      const displayNames = {
        sensorLocations: "Sensors",
        postalCodeBoundaries: "CAPs",
        neighborhoods: "Neighborhoods",
        zones: "Zones",
        ztl: "ZTL",
      };
      return displayNames[key] || key;
    },
    getOrangeColorPalette() {
      return {
        veryLightPeachyOrange: "#ffc499",
        lightPeachyOrange: "#ffb680",
        veryPaleOrange: "#ffac66",
        paleOrange: "#ff9f4c",
        pastelOrange: "#ff9a47",
        lightOrange: "#ff9232",
        softOrange: "#ff8f38",
        slightlyLighter: "#ff8519",
        baseOrange: "#ff7800",
        slightlyDarker: "#ff6a00",
        brightOrangeRed: "#ff6200",
        darkerOrange: "#ff5c00",
        deepOrange: "#ff4e00",
        veryDeepOrange: "#ff4000",
        mutedOrange: "#eb7000",
        earthyOrange: "#e56e00",
        brownishOrange: "#d66600",
        deepEarthyOrange: "#cc6200",
        darkBrownishOrange: "#c25d00",
      };
    },
    getLayerConfig(layer, colors) {
      const configs = {
        // Postal Code Boundaries of the Municipality of Bologna
        postalCodeBoundaries: {
          propertyKey: "cap",
          labelKey: "CAP",
          colorMap: {
            40121: colors.veryLightPeachyOrange,
            40122: colors.lightPeachyOrange,
            40123: colors.veryPaleOrange,
            40124: colors.paleOrange,
            40125: colors.pastelOrange,
            40126: colors.lightOrange,
            40127: colors.softOrange,
            40128: colors.slightlyLighter,
            40129: colors.baseOrange,
            40131: colors.slightlyDarker,
            40132: colors.brightOrangeRed,
            40133: colors.darkerOrange,
            40134: colors.deepOrange,
            40135: colors.veryDeepOrange,
            40136: colors.mutedOrange,
            40137: colors.earthyOrange,
            40138: colors.brownishOrange,
            40139: colors.deepEarthyOrange,
            40141: colors.darkBrownishOrange,
          },
        },
        // Neighborhoods of the Municipality of Bologna
        neighborhoods: {
          propertyKey: "cod_quar",
          labelKey: "Quartiere",
          displayKey: "quartiere",
          colorMap: {
            11: colors.lightPeachyOrange,
            12: colors.paleOrange,
            13: colors.lightOrange,
            14: colors.slightlyLighter,
            15: colors.darkerOrange,
            16: colors.darkBrownishOrange,
          },
        },
        // Zones of the Municipality of Bologna
        zones: {
          propertyKey: "numquart",
          labelKey: "Zona",
          displayKey: "nomezona",
          colorMap: {
            11: colors.veryPaleOrange,
            12: colors.pastelOrange,
            13: colors.softOrange,
            14: colors.baseOrange,
            15: colors.brightOrangeRed,
            16: colors.deepOrange,
          },
        },
        ztl: {
          propertyKey: "@id",
          labelKey: "ZTL",
          displayKey: "alt_name",
          colorMap: {},
        },
      };

      return configs[layer];
    },
    centerOnLocation(lat, lng, zoom = 16) {
      if (!this.map) throw "Map not initialized";

      this.map.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.5, // sec
      });
    },
    onGridChange() {
      const mapContainer = document.querySelector(".map-container");
      if (!mapContainer) return;
      mapContainer.classList.remove(
        "grid-simple",
        "grid-dark",
        "grid-fine",
        "grid-coordinate",
        "grid-crosshair",
        "grid-dashed",
        "grid-dots",
        "grid-animated"
      );
      if (this.gridType !== "none")
        mapContainer.classList.add(`grid-${this.gridType}`);
    },
    clearMeasurements() {
      const count =
        this.measurements[this.selectedMeasurement].heatLatLng.length;
      for (const measurementType of Object.keys(this.measurements))
        this.measurements[measurementType].heatLatLng = [];
      this.updateHeatmap();
      this.$emit("measurements-cleared", count);
    },
  },
  async mounted() {
    this.initMap();

    /*const layers = [
      "sensorLocations",
      "postalCodeBoundaries",
      "neighborhoods",
      "zones",
      "ztl",
    ];

    for (const layer of layers) {
      await this.populateLayer(layer);
      if (this.show[layer]) this.drawLayer(layer);
    }*/
  },
};
