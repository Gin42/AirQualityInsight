<script>
import { mapState, mapGetters } from "vuex";
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
    clearMeasurements() {
      /** Vogliamo che questo cancelli tutte le misurazioni registrate? O dovrebbe cancellare solo
       *  quelle di questa tabella?
       */
      console.log("Clear measurement");
      //TO DO: this.collectedMeasurement.data = [];
    },
  },
  created() {},
};
</script>

<template>
  <h1>Hi i'm last measurements</h1>
  <div class="dashboard-component measurements-component-container">
    <div class="component-header">
      <h2>Last {{ this.maxMessages }} measurements received</h2>
      <div class="component-header-buttons">
        <button @click="clearMeasurements" class="btn btn-danger">
          <i class="fas fa-trash"></i> Clear
        </button>
      </div>
    </div>
    <TableComponent
      ref="measurementComponent"
      :data="collectedMeasurement"
      :columns="getMeasurementsTable.columns"
    />
  </div>
</template>
