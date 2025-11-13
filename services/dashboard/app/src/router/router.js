import { createWebHistory, createRouter } from "vue-router";

import HomeView from "../views/HomeView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import MapView from "../views/MapView.vue";
import StatsView from "../views/StatsView.vue";
import LiveEAQIView from "../views/LiveEAQIView.vue";
import LastMeasurementsView from "../views/LastMeasurementsView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/:pathMatch(.*)*", component: NotFoundView },
  { path: "/map", component: MapView },
  { path: "/stats", component: StatsView },
  { path: "/liveEaqi", component: LiveEAQIView },
  { path: "/lastMeasurements", component: LastMeasurementsView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
