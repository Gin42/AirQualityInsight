<script>
import { mapState, mapGetters } from "vuex";
import TableComponent from "../assets/components/TableComponent.vue";
import tableData from "../assets/data/tableData.json";

export default {
  name: "HomeView",
  computed: {
    ...mapState({
      center: (state) => state.map.center,
    }),
    ...mapGetters("data", ["getMeasurementsTypes"]),
  },
  components: {
    TableComponent,
  },
  data() {
    return {
      infoMeasurement: tableData.infoTable,
    };
  },
  methods: {
    createInfoIcon(title) {
      return `<i class="fas fa-info-circle" title="${title}"></i>`;
    },
  },
  created() {
    const explainThreshold = (threshold, extremely_poor = false) => {
      if (Array.isArray(threshold) && extremely_poor) return threshold;
      if (Array.isArray(threshold))
        return `&ge; ${threshold[0]}, &le; ${threshold[1]}`;
      if (extremely_poor) return `&gt; ${threshold}`;
      return `&le; ${threshold}`;
    };

    console.log("TYPES", this.getMeasurementsTypes);
    console.log(this.infoMeasurement);

    for (const [key, data] of Object.entries(this.getMeasurementsTypes)) {
      this.infoMeasurement.data.push({
        measurement: data.label,
        measurementUnit: data.info.measurementUnit,
        min: data.info.min,
        max: data.info.max,
        thresholdGood: explainThreshold(data.thresholds.good),
        thresholdFair: explainThreshold(data.thresholds.fair),
        thresholdModerate: explainThreshold(data.thresholds.moderate),
        thresholdPoor: explainThreshold(data.thresholds.poor),
        thresholdVeryPoor: explainThreshold(data.thresholds.very_poor),
        thresholdExtremelyPoor: explainThreshold(
          data.thresholds.extremely_poor,
          true,
        ),
        info: this.createInfoIcon(data.info.description),
      });
    }
  },
};
</script>

<template>
  <div class="dashboard-component info-component-container">
    <div class="description">
      <h2>Description</h2>
      <p>
        Simulation project of a sensor system to monitor air quality, with data
        sent to a server for real-time analysis and visualization.
      </p>
      <p>
        The system simulates a network of sensors, such as Raspberry Pi, capable
        of measuring air quality. These measurements will be sent to a server,
        which will analyze them and present the data in real-time on a dedicated
        dashboard.
      </p>
      <p>
        <span>
          The case study subject is the city of Bologna, the sensors are
          displaced into his boundaries.
        </span>
        <span>
          The center of the map is located in
          <i>“{{ center.name }}”</i> [ lat: <code>{{ center.lat }}</code
          >, lng: <code>{{ center.lng }}</code>
          ].
        </span>
        <span>
          The distance of the sensors from the center is in meters [m].
        </span>
      </p>
      <p class="project-link">
        <i class="fa-brands fa-github"></i>
        <a href="https://github.com/MatteoZenoBagli/AirQualityInsight"
          >GitHub's project page link</a
        >
      </p>
    </div>

    <div class="measurement-ranges">
      <h2>Measurement ranges</h2>
      <TableComponent
        ref="measurementComponent"
        :data="infoMeasurement.data"
        :columns="infoMeasurement.columns"
      />
      <p>
        The table above explains what types of measurements are collected and
        how they are interpreted. It shows the measurement name, the unit of
        measurement, the sampling interval, and 3 indicators that represent the
        quality of the obtained measurement: the closer the measurement value is
        to the quality thresholds, the better the value. If you hover the cursor
        over the information label, a brief description of the measure is
        displayed.
      </p>
    </div>
  </div>
</template>
