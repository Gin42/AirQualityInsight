<script>
import { mapState, mapGetters, mapActions } from "vuex";
import TableComponent from "@/assets/components/TableComponent.vue";

export default {
  name: "LastMeasurementsView",
  components: { TableComponent },
  computed: {
    ...mapState({
      maxMessages: (state) => state.maxMessages,
      collectedMeasurement: (state) => state.measurements.measurements,
    }),
    ...mapGetters("table", ["getMeasurementsTable"]),
    ...mapGetters("sensors", ["getSensor"]),
  },
  methods: {
    refreshTable() {
      //this.addInfo("Refreshed measurements table");
    },
    clearMeasurements() {
      //TO DO: this.collectedMeasurement.data = [];
    },
    handleMeasurementRowClick(row) {
      // Center map on the sensor that sent this measurement
      const sensor = this.getSensor(row.sensor_id);
      if (!sensor)
        return this.addWarning(
          `Sensor ${row.sensor_id} not found in registered sensors`
        );
      this.centerMapOnSensor(sensor);
      this.addInfo(`Selected sensor: ${row.sensor_id}`);
    },
  },
};
</script>

<template>
  <h1>Hi i'm last measurements</h1>
  <div class="dashboard-component measurements-component-container">
    <div class="component-header">
      <h2>Last {{ this.maxMessages }} measurements received</h2>
      <div class="component-header-buttons">
        <button @click="refreshTable" class="btn">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
        <button @click="clearMeasurements" class="btn btn-danger">
          <i class="fas fa-trash"></i> Clear
        </button>
      </div>
    </div>
    <TableComponent
      ref="measurementComponent"
      :data="collectedMeasurement"
      :columns="getMeasurementsTable.columns"
      @row-click="handleMeasurementRowClick"
    />
  </div>
</template>
