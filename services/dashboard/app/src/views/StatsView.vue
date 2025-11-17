<script>
import { mapGetters } from "vuex";

export default {
  name: "StatsView",
  computed: {
    ...mapGetters("sensors", ["allSensors"]),
  },
  methods: {
    clearStats() {
      for (const [key, data] of Object.entries(this.measurements))
        this.statsMeasurement.data[key] = {
          measurement: data.label,
          mean: "N/A",
          median: "N/A",
          min: "N/A",
          max: "N/A",
          range: "N/A",
          quality: "N/A",
        };
    },
  },
};
</script>

<template>
  <h1>Hi i'm stats</h1>

  <div class="dashboard-component stats-component-container">
    <div class="component-header">
      <h2>Statistics</h2>
      <button @click="clearStats" class="btn btn-danger">
        <i class="fas fa-trash"></i> Clear
      </button>
    </div>
    <TableComponent
      ref="measurementComponent"
      :data="Object.values(statsMeasurement.data)"
      :columns="statsMeasurement.columns"
    />
  </div>
</template>
