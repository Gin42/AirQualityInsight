import { createWebHistory, createRouter } from "vue-router";

import HomeView from "../views/HomeView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import MapView from "../views/MapView.vue";
import StatsView from "../views/StatsView.vue";
import LastMeasurementsView from "../views/LastMeasurementsView.vue";
import AuthView from "@/views/AuthView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/:pathMatch(.*)*", component: NotFoundView },
  { path: "/map", component: MapView },
  { path: "/stats", component: StatsView },
  { path: "/lastMeasurements", component: LastMeasurementsView },
  {
    path: "/sign-up",
    component: AuthView,
    props: { type: "sign-up" },
  },
  {
    path: "/login",
    component: AuthView,
    props: { type: "login" },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
