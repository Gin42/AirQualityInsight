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
        aria-label="Toggle menu"
      >
        <i class="fa-solid fa-bars menu-icon" v-if="!isMobileMenuOpen"></i>
        <i class="fa-solid fa-xmark menu-icon" v-if="isMobileMenuOpen"></i>
      </button>

      <img src="../icons/logo.svg" alt="AirQualityInsight logo" class="logo" />

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
        <li class="nav-route">
          <RouterLink
            to="/login"
            @click="isMobileMenuOpen = false"
            v-if="!username"
          >
            <i class="fa-solid fa-arrow-right-to-bracket"></i>
            Login
          </RouterLink>
          <div
            class="log-link"
            v-if="username"
            @click="
              () => {
                isMobileMenuOpen = false;
                logoutAction();
              }
            "
          >
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            Logout
          </div>
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

.logo {
  height: inherit;
  padding: 0.3rem;
}

.website-name {
  font-size: 1.5em;
  font-weight: bold;
  cursor: default;
  flex: 1;
  margin: 0;
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
  height: inherit;
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

.router-link-active {
  border-bottom: 3px solid black;
}

li.nav-route a,
.log-link {
  text-decoration: none;
  color: var(--secondary-text-color);
  padding: 0.2rem 0.3rem;
}

.navbar-menu li i {
  display: none;
  margin-right: 1rem;
}

.menu-icon {
  margin-right: 1rem;
}

.log-link {
  cursor: pointer;
}

@media (max-width: 800px) {
  .logo {
    display: none;
  }

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
    margin: -1rem;
    z-index: 10;
  }

  .username {
    font-size: 1em !important;
  }
}
</style>
