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
  <div class="dashboard-component measurements-component-container">
    <div class="component-header">
      <h2>Last {{ this.maxMessages }} measurements received</h2>

      <button @click="clearMeasurements" class="btn danger-color">
        <i class="fas fa-trash"></i> Clear
      </button>
    </div>
    <TableComponent
      ref="measurementComponent"
      :data="collectedMeasurement"
      :columns="getMeasurementsTable.columns"
    />
  </div>
</template>

<style lang="scss">
.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
