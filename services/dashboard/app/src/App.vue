<!-- App.vue -->
<script>
import { mapGetters, mapActions } from "vuex";
import TopNavComponent from "./assets/components/TopNavComponent.vue";

export default {
  name: "App",
  components: { TopNavComponent },

  methods: {
    ...mapActions("user", ["checkAuth"]),
    ...mapActions(["initializeAll"]),
    setCookies() {
      this.$cookies.set("refreshToken", "", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      this.$cookies.set("authToken", "", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    },
  },
  computed: {
    ...mapGetters(["isInitialized"]),
  },
};
</script>

<template>
  <TopNavComponent v-if="isInitialized"></TopNavComponent>
  <div class="dashboard">
    <RouterView></RouterView>
  </div>
</template>

<style lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  height: 90vh;
}

.dashboard > * {
  flex-shrink: 0;
  padding: 0 1rem 2rem 1rem;
}

.dashboard RouterView {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
