import { createWebHistory, createRouter } from "vue-router";
import { useStore } from "vuex";
import HomeView from "../views/HomeView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import MapView from "../views/MapView.vue";
import StatsView from "../views/StatsView.vue";
import LastMeasurementsView from "../views/LastMeasurementsView.vue";
import AuthView from "@/views/AuthView.vue";
import LoadingView from "@/views/LoadingView.vue";

const routes = [
  { path: "/", component: HomeView, name: "Home" },
  { path: "/:pathMatch(.*)*", component: NotFoundView },
  { path: "/map", component: MapView, name: "Map" },
  { path: "/stats", component: StatsView, name: "Stats" },
  {
    path: "/lastMeasurements",
    component: LastMeasurementsView,
    name: "Last measurement",
  },
  { path: "/login", component: AuthView },
  { path: "/loading", component: LoadingView, name: "Loading" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const store = useStore();

  if (!store.getters.isInitialized && to.name !== "Loading") {
    return next({ name: "Loading" });
  }

  await checkAuthValidity(store);

  if (to.name === "Loading") {
    return next({ name: "Home" });
  }

  next();
});

async function checkAuthValidity(store) {
  await store.dispatch("user/checkAuth");
}

export { router };
