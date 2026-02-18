<script>
import { TrinityRingsSpinner } from "epic-spinners";
import { mapGetters } from "vuex";

export default {
  name: "LoadingView",
  computed: {
    ...mapGetters(["isAppReady"]),
  },
  components: {
    TrinityRingsSpinner,
  },
};
</script>

<template>
  <div class="loading-screen">
    <div class="loading-card surface-color">
      <img
        src="../assets/icons/logo.svg"
        alt="AirQualityInsight logo"
        class="loading-logo"
      />

      <p class="project-desc">
        This project simulates a sensors' network to monitor air quality, with
        fictitious data sent to a server for real-time analysis and
        visualization.
      </p>

      <TrinityRingsSpinner
        :animation-duration="1500"
        :size="66"
        color="#3590f3"
        class="loading-spinner"
      />
    </div>
  </div>
</template>

<style>
.loading-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  width: 80%;
  max-width: 600px;
  padding: 2rem;
  border-radius: 16px;
  border: solid 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.project-desc {
  width: 70%;
  text-align: center;
}
.loading-logo {
  height: 10rem;
  padding: 0.3rem;
}
</style>
