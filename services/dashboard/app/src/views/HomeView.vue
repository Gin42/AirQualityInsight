<script>
import { mapState, mapGetters } from "vuex";
import TableComponent from "../assets/components/TableComponent.vue";
import tableData from "../assets/data/tableData.json";
import McpChat from "@/assets/components/McpChat.vue";

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
    McpChat,
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
    async sendTest() {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const res = await fetch(`${apiUrl}/api/sensor`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`Backend error: ${res.status}`);

      const selectedSensor = await res.json();
      console.log(selectedSensor);
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

    this.infoMeasurement.data = [];

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
  <McpChat></McpChat>
  <div class="dashboard-component info-component-container">
    <div class="description">
      <h2>Description</h2>
      <p>
        This project simulate a sensors' newtwork to monitor air quality, with
        fictitious data sent to a server for real-time analysis and
        visualization on a dedicated dashboard.
      </p>
      <p>
        An user can be a normal user or have administrator permits. The first
        can view the collected data via an interactive map or examine statistics
        via tables, while the latter can interact with the sensors, modifying,
        deleting, or adding new ones. They will also have access to a virtual
        agent capable of performing the aforementioned operations on demand.
      </p>

      <!-- TEST BUTTON
      <button @click="sendTest">TRY SEARCH</button>
      -->

      <p class="project-link">
        <i class="fa-brands fa-github"></i>
        <a href="https://github.com/Gin42/AirQualityInsight.git"
          >GitHub's project page link</a
        >
      </p>
    </div>

    <h2>Measurement ranges</h2>
    <p class="ranges">
      The table below explains what types of measurements are collected and how
      they are interpreted. It shows the measurement name, the unit of
      measurement, the sampling interval, and the ranges of each quality
      threshold. If you hover the cursor over the information label, a brief
      description of the measure is displayed.
    </p>

    <div class="measurement-ranges">
      <TableComponent
        ref="measurementComponent"
        :data="infoMeasurement.data"
        :columns="infoMeasurement.columns"
      />
    </div>
  </div>
</template>

<style>
.info-component-container {
  grid-area: info;
  display: flex;
  flex-direction: column;

  p {
    margin: 0.3rem 0;
  }

  .description,
  .measurement-ranges {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: start;

    h2 {
      margin-bottom: 0.5rem;
    }
  }

  .description .project-link {
    display: flex;
    gap: 0.5rem;
  }

  .description p:not(.project-link) {
    display: flex;
    flex-direction: column;
  }

  .measurement-ranges .table-wrapper {
    height: auto;
  }

  p.ranges {
    margin-bottom: 0.5rem;
  }
}
</style>
