<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "LoginForm",
  computed: {
    ...mapState("user", ["username"]),
  },
  methods: {
    ...mapActions("user", ["logout"]),
    logoutAction() {
      this.logout();
    },
  },
};
</script>

<template>
  <nav class="primary-color">
    <p class="website-name">AirQualityInsight</p>
    <ul class="nav-list">
      <li class="nav-route">
        <RouterLink to="/"> Home </RouterLink>
      </li>
      <li class="nav-route">
        <RouterLink to="/map"> Map </RouterLink>
      </li>
      <li class="nav-route">
        <RouterLink to="/lastMeasurements"> Last measurements </RouterLink>
      </li>
      <li class="nav-route">
        <RouterLink to="/stats"> Statistics </RouterLink>
      </li>
    </ul>
    <div class="buttons">
      <button v-if="!username" class="auth-button tertiary-color">
        <RouterLink to="/login"> Login </RouterLink>
      </button>
      <button
        v-if="username"
        class="auth-button tertiary-color"
        @click="logoutAction"
      >
        Logout
      </button>
    </div>
    <p>{{ this.username ? this.username : "Guest" }}</p>
  </nav>
</template>

<style lang="scss">
nav {
  display: flex;
  flex-direction: row;
  height: 4rem;
  overflow: hidden;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

nav.primary-color:hover {
  background-color: var(--primary-color);
}

.website-name {
  font-size: 2em;
  font-weight: bold;
  cursor: default;
}

ul.nav-list {
  flex-direction: row;
  list-style-type: none;
  align-items: center;
  padding: 0;
  margin: 0;
  height: 100%;
  gap: 4rem;
}

ul.nav-list li {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
}

ul.nav-list li:hover {
  background-color: var(--primary-hover);
}

li.nav-route a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.3em;
  font-style: normal;
  text-decoration: none;
  color: var(--secondary-text-color);
}

.auth-button {
  border: none;
  text-align: center;
  border-radius: 8px;
  padding: 0;
}

.auth-button a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.2em;
  font-style: normal;
  text-decoration: none;
  color: var(--secondary-text-color);
  letter-spacing: inherit;
  padding: 0.75rem 1.5rem;
}

div.buttons {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}
</style>
