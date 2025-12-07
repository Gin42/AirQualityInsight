// main.js
import "./assets/styles/style.scss"; //forse da eliminare

import { createApp } from "vue";
import { store } from "./store";
import { router } from "./router/router";
import "./services/kafka";
import VueCookies from "vue-cookies";
import App from "./App.vue";

const app = createApp(App);

app.use(store);
app.use(router);
app.use(VueCookies);

app.mount("#app");
