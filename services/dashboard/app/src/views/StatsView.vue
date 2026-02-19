<script>
import TableComponent from "@/assets/components/TableComponent.vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  name: "StatsView",
  components: { TableComponent },
  computed: {
    ...mapState({
      eaqi: (state) => state.stats.eaqi,
      timestamp: (state) => state.stats.timestamp,
    }),
    ...mapGetters("stats", ["getStats", "getEaqi"]),
    ...mapGetters("table", ["getStatsTable"]),
  },
};
</script>

<template>
  <div class="stats-container">
    <div class="dashboard-component eaqi-component-container">
      <div class="component-header eaqi-desc-container">
        <h2>Current EAQI (European Air Quality Index)</h2>
        <div>
          The EAQI (European Air Quality Index) is and index based on
          concentration values for up to five key pollutants:
          <ul class="eaqi-desc">
            <li>Coarse particulate matter (PM10)</li>
            <li>Fine particulate matter (PM2.5)</li>
            <li>Nitrogen dioxide (NO2)</li>
            <li>Ozone (O3)</li>
            <li>Sulphur dioxide (SO2)</li>
          </ul>
          Each pollutant gets a sub-index based on its concentration against the
          EAQI thresholds. The worst sub-index among all measured pollutants
          becomes the overall EAQI.
        </div>
      </div>

      <div v-if="eaqi" class="surface-color eaqi-container">
        <h2 class="eaqi-title">Live EAQI</h2>

        <ul class="eaqi-list">
          <div class="quality-row">
            <li>
              <div
                class="quality-visual"
                :style="{
                  backgroundColor: eaqi?.quality?.color || 'transparent',
                }"
              ></div>
            </li>
            <div>
              <li>The <b>quality</b> is {{ eaqi?.quality?.label ?? "N/A" }}</li>
              <li>
                The <b>worst pollutant</b> is {{ eaqi?.measurement ?? "N/A" }}
              </li>
              <li>
                Its <b>mean concentration</b> is {{ eaqi?.mean ?? "N/A" }} µg/m³
              </li>
              <li>
                <p class="small-text">
                  [Calculated on {{ timestamp ?? "N/A" }} ]
                </p>
              </li>
            </div>
          </div>

          <hr />
          <li>
            <b>Health advice:</b>
            <ul class="eaqi-list health-list">
              <li>
                <b>General population:</b>
                {{ eaqi?.intensity?.advice?.general ?? "N/A" }}
              </li>
              <li>
                <b>Sensitive population:</b>
                {{ eaqi?.intensity?.advice?.sensitive ?? "N/A" }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <div class="dashboard-component stats-component-container">
      <div class="component-header stats-header">
        <div class="header-title">
          <h2>Statistics</h2>
          <p class="small-text">[Calculated on {{ timestamp ?? "N/A" }} ]</p>
        </div>
      </div>
      <TableComponent
        ref="measurementComponent"
        :data="Object.values(getStats)"
        :columns="getStatsTable.columns"
      />
    </div>
  </div>
</template>

<style lang="scss">
.small-text {
  margin: 0;
  font-size: 0.7em;
  color: var(--text-color);
}

.stats-container {
  padding-bottom: 2rem;
}

.header-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  margin: 1rem 0;

  h2 {
    margin: 0;
  }
}

.eaqi-desc,
.eaqi-list {
  display: flex;
  flex-direction: column;
}

.eaqi-component-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: fit-content;
  padding: 1rem;
  gap: 2rem;
}

.eaqi-container {
  width: 50%;
  border: 2px solid black;
  border-radius: 1rem;
  padding: 1rem;
}

.eaqi-title {
  margin-top: 0;
}

.eaqi-desc-container {
  width: 50%;
}

.eaqi-list {
  gap: 0.5rem;
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
}

.quality-visual {
  width: 5rem;
  height: 5rem;
  border: 2px solid black;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.quality-visual p {
  margin: 0;
  font-weight: bold;
}

.quality-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.quality-row > div {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

hr {
  width: 100%;
}

.health-list {
  margin-top: 1rem;
}

.stats-header {
  margin: 0 !important;
  padding: 0 !important;
}

@media (max-width: 650px) {
  .eaqi-component-container {
    display: flex;
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .eaqi-container,
  .eaqi-desc-container {
    width: 100%;
  }

  .eaqi-container {
    flex: 1;
  }
}
</style>
