import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import { ref } from "vue";
import { mapState, mapMutations, mapActions, mapGetters } from "vuex";
import pushpinSvg from "@/assets/pushpin.svg";
import pushpinHomeSvg from "@/assets/pushpinVector.svg";
import { fetchFromApi } from "@/services/api";

import { TrinityRingsSpinner } from "epic-spinners";

export default {
  name: "MapComponent",
  computed: {
    ...mapState({
      sensors: (state) => state.sensors.sensors,
      center: (state) => state.center,
      newMeasurement: (state) => state.measurements.measurements,
      newSensor: (state) => state.sensors.newSensor,
      currentMeasurements: (state) => state.currentMeasurements,
    }),
    ...mapGetters("measurements", ["lastMeasurement", "allMeasurementsCount"]),
    ...mapGetters("sensors", ["getSensor", "allSensorsCount", "allSensors"]),
    ...mapGetters("socket", ["isSocketConnected", "isServerReady"]),
    sliderValue: {
      get() {
        return this.currentMeasurements;
      },
      set(value) {
        this.setCurrentMeasurements(value);
      },
    },
  },
  watch: {
    newSensor: {
      // to-do
      immediate: true,
      handler() {
        if (this.newSensor.incoming) {
          this.drawSensor(this.newSensor.data, "sensorLocations");
          this.setNewSensor(false);
        }
      },
      deep: true,
    },
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
  components: {
    TrinityRingsSpinner,
  },

  data() {
    return {
      zoom: ref(13),
      map: null,
      heatLayer: null,
      loading: ref(false),
      selectedMeasurement: "pm25",
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
    ...mapMutations(["setCenter", "setCurrentMeasurements"]),
    ...mapMutations("sensors", ["setNewSensor"]),
    ...mapActions("sensors", [
      "fetchSensors",
      "updateLastMeasurement",
      "addSensor",
    ]),

    initMap() {
      // Leaflet's interactive map
      try {
        this.map = L.map("map").setView(
          [this.center.lat, this.center.lng],
          this.zoom
        );
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }

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
        this.setCenter({ currentLng, currentLat });
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
      for (const threshold of Object.values(this.thresholds)) {
        gradient[threshold.value] = threshold.color;
      }

      this.heatLayer = L.heatLayer([], {
        radius: 30,
        blur: 25,
        maxZoom: 17,
        gradient,
      }).addTo(this.map);

      //se clicco sulla mappa posso aggiungere un pin nell coordinate selezionate
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
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&${params}`
        );

        const { road, house_number, city, country } = response.address;

        const addressParts = [road, city, house_number, country].filter(
          Boolean
        );
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

    async drawLayer(layer) {
      if (!this.data[layer]) return console.error("Data not provided");
      const pushpinIcon = L.icon({
        iconUrl: pushpinSvg,
        iconSize: [24, 24],
        iconAnchor: [12, 20],
        popupAnchor: [0, -20],
      });

      if ("sensorLocations" === layer) {
        for (const sensorLocation of this.allSensors) {
          const marker = L.marker(
            [sensorLocation.getLat(), sensorLocation.getLng()],
            {
              icon: pushpinIcon,
            }
          );
          marker.bindPopup(sensorLocation.getName());
          marker.addTo(this.map);
          marker.on("click", () => {
            this.$emit("marker-click", sensorLocation);
          });

          this.layers[layer].push(marker);
          sensorLocation.setMarker(marker);
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

    clearLayer(layer) {
      for (const l of this.layers[layer]) if (this.map) this.map.removeLayer(l);
      this.layers[layer] = [];
    },

    /** Dato che al momento passo da kafka per aggiornare le misurazioni dei sensori
     * questo metodo rimane utile solo per la heat map, e dato che non mi soddisfa
     * l'attuale setting per quest'ultima, lo commmento con un to-do
     */
    registerNewMeasurement(data) {
      if (this.allSensorsCount === 0) return;

      const id = data.sensor_id;

      const sensor = this.getSensor(id);
      if (!sensor) return;

      this.highlightSensor(sensor);
      /*
      this.updateLastMeasurement(id, data);
      for (const measurementType of Object.keys(this.measurements)) {
        const intensity = this.getIntensity({
          concentration: data[measurementType],
          pollutant: measurementType,
        });
        const latLng = [sensor.lat, sensor.lng, intensity.value];
        this.measurements[measurementType].heatLatLng.unshift(latLng);
        if (
          this.measurements[measurementType].heatLatLng.length >
          currentMeasurement
        ) {
          this.measurements[measurementType].heatLatLng = this.measurements[
            measurementType
          ].heatLatLng.slice(0, currentMeasurement);
        }
      }
      this.updateHeatmap();*/
    },

    highlightSensor(sensor) {
      const marker = sensor.getMarker();
      if (marker != null) {
        marker.setOpacity(0.2);
        setTimeout(() => {
          marker.setOpacity(1);
        }, 250);
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

    updateHeatmap() {
      this.heatLayer.setLatLngs(
        this.measurements[this.selectedMeasurement].heatLatLng
      );
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

    async refreshSensorData() {
      if (this.allSensorsCount == 0) throw "Data not provided";
      this.drawLayer("sensorLocations");
    },

    async drawSensor(sensor, layer) {
      const pushpinIcon = L.icon({
        iconUrl: pushpinSvg,
        iconSize: [24, 24],
        iconAnchor: [12, 20],
        popupAnchor: [0, -20],
      });
      if ("sensorLocations" === layer) {
        const marker = L.marker([sensor.getLat(), sensor.getLng()], {
          icon: pushpinIcon,
        });
        marker.bindPopup(sensor.getName());
        marker.addTo(this.map);
        marker.on("click", () => {
          this.$emit("marker-click", sensor);
        });

        this.layers[layer].push(marker);
        sensor.setMarker(marker);
        return;
      }
    },

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

    async populateLayer(layer) {
      if (layer === "sensorLocations") {
        return;
      }

      const dataFile = {
        postalCodeBoundaries: "caps.geojson",
        neighborhoods: "neighborhoods.geojson",
        zones: "zones.geojson",
        ztl: "ztl.geojson",
      };

      try {
        const data = await this.loadData(dataFile[layer]);
        if (!data) throw new Error("Data not provided");
        this.data[layer] = data.features;
      } catch (error) {
        console.error("Error loading layer data:", error);
      }
    },
  },
  async mounted() {
    try {
      while (!this.isSocketConnected || !this.isServerReady) {
        await new Promise((r) => setTimeout(r, 100));
      }

      this.loading = false;

      this.initMap();

      /**
       * TODO: c'è un qualche problema di race condition per cui se sensorLocation è il primo
       * ad essere esaminato non riesce a caricare correttamente i sensori.
       * Al momento posso semplicemente spostarlo in fondo all'array, ma dato che vorrei cancellare
       * i vari tipi di layers, devo capire se poi da ancora errore
       */
      const layers = [
        "postalCodeBoundaries",
        "neighborhoods",
        "zones",
        "ztl",
        "sensorLocations",
      ];

      for (const layer of layers) {
        await this.populateLayer(layer);
        if (this.show[layer]) {
          this.drawLayer(layer);
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  },
};
