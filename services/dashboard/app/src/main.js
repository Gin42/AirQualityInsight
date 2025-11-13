// main.js
import "./assets/main.css";

import { createApp } from "vue";
import { store } from "./store";
import { router } from "./router/router";
import App from "./App.vue";

const app = createApp(App);

app.use(store);
app.use(router);

app.mount("#app");
