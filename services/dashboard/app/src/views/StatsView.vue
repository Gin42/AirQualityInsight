<script>
import TableComponent from "@/assets/components/TableComponent.vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  name: "StatsView",
  components: { TableComponent },
  computed: {
    ...mapState({
      eaqi: (state) => state.stats.eaqi,
    }),
    ...mapGetters("stats", ["getStats", "getEaqi"]),
    ...mapGetters("table", ["getStatsTable"]),
  },
  methods: {
    ...mapActions("stats", ["clearStats"]),
  },
};
</script>

<template>
  <h1>Hi, I'm stats</h1>
  <div class="dashboard-component stats-component-container">
    <div class="component-header">
      <h2>Statistics</h2>
      <button @click="this.clearStats" class="btn btn-danger">
        <i class="fas fa-trash"></i> Clear
      </button>
    </div>
    <TableComponent
      ref="measurementComponent"
      :data="Object.values(getStats)"
      :columns="getStatsTable.columns"
    />
  </div>

  <div class="dashboard-component eaqi-component-container">
    <div class="component-header">
      <h2>Current EAQI (European Air Quality Index)</h2>
    </div>
    <div>
      <div>
        The EAQI (European Air Quality Index) is and index based on
        concentration values for up to five key pollutants:
        <ul>
          <li>Particulate matter (PM10)</li>
          <li>Fine particulate matter (PM2.5)</li>
          <li>Nitrogen dioxide (NO2)</li>
          <li>Ozone (O3)</li>
          <li>Sulphur dioxide (SO2)</li>
        </ul>
        Each pollutant gets a sub-index based on its concentration against the
        EAQI thresholds. The worst sub-index among all measured pollutants
        becomes the overall EAQI.
      </div>
      <div v-if="eaqi">
        <h3>Live EAQI</h3>
        <ul>
          <li style="display: flex; gap: 0.5rem">
            Quality: <span v-html="eaqi?.quality ?? 'N/A'"></span>
          </li>
          <li>Worst pollutant: {{ eaqi?.measurement ?? "N/A" }}</li>
          <li>Mean concentration: {{ eaqi?.mean ?? "N/A" }} µg/m³</li>
          <li>
            Health advice:
            <ul>
              <li>
                General population:
                {{ eaqi?.intensity?.advice?.general ?? "N/A" }}
              </li>
              <li>
                Sensitive population:
                {{ eaqi?.intensity?.advice?.sensitive ?? "N/A" }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
