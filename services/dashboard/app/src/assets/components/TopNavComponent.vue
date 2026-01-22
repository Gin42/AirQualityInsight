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
  data() {
    return {
      isMobileMenuOpen: false,
    };
  },
};
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <button
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="navbar-toggle icon-button"
      >
        <i class="fa-solid fa-bars" v-if="!isMobileMenuOpen"></i>
        <i class="fa-solid fa-xmark" v-if="isMobileMenuOpen"></i>
      </button>

      <p class="website-name">AirQualityInsight</p>

      <ul :class="['navbar-menu', { open: isMobileMenuOpen }]">
        <li class="nav-route">
          <RouterLink to="/" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-house"></i>
            Home
          </RouterLink>
        </li>
        <li class="nav-route">
          <RouterLink to="/map" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-map-location-dot"></i>
            Map
          </RouterLink>
        </li>
        <li class="nav-route">
          <RouterLink to="/lastMeasurements" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-tower-broadcast"></i>
            Last measurements
          </RouterLink>
        </li>
        <li class="nav-route">
          <RouterLink to="/stats" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-chart-line"></i>
            Statistics
          </RouterLink>
        </li>
        <li class="auth-div">
          <button v-if="!username" class="auth-button tertiary-color">
            <RouterLink to="/login" @click="isMobileMenuOpen = false">
              Login
            </RouterLink>
          </button>
          <button
            v-if="username"
            class="auth-button tertiary-color"
            @click="
              () => {
                isMobileMenuOpen = false;
                logoutAction();
              }
            "
          >
            Logout
          </button>
          <p class="username">{{ this.username ? this.username : "Guest" }}</p>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style lang="scss">
.navbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3rem;
  padding: 0 1rem;
  position: relative;
  background-color: var(--primary-color);
}

.website-name {
  font-size: 1.5em;
  font-weight: bold;
  cursor: default;
  flex: 1;
}

.navbar-toggle {
  display: none;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

ul.navbar-menu {
  display: flex;
  flex-direction: row;
  list-style-type: none;
  align-items: center;
  padding: 0;
  margin: 0;
}

ul.navbar-menu li {
  padding: 0 1rem;
}

li.nav-route a,
.auth-button a {
  text-decoration: none;
  color: var(--secondary-text-color);
}

.auth-div {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
}

.auth-button {
  margin: 0.5rem 0;
  font-size: 1em;
  padding: 0.5rem;
  height: fit-content;
}

.navbar-menu li i {
  display: none;
  margin-right: 1rem;
}

@media (max-width: 800px) {
  .navbar-toggle {
    display: contents;
    justify-self: start;
  }

  .navbar-container {
    justify-content: center;
  }

  ul.navbar-menu {
    display: none;
    flex-direction: column;
    align-items: start;
    position: absolute;

    top: 60px;
    left: 0;
    right: 0;
    padding: 1rem;
    background-color: var(--primary-color);

    gap: 2rem;
    padding-top: 3rem;
  }

  ul.navbar-menu p,
  ul.navbar-menu i,
  .nav-route {
    font-size: 1.5rem;
  }

  .navbar-menu li i {
    display: inline-block;
  }

  .navbar-menu.open {
    display: flex;
    width: -webkit-fill-available;
    height: 100vh;
    margin: 0 -1rem;
    z-index: 10;
  }

  .username {
    font-size: 1em !important;
  }
}
</style>
