<template>
  <p class="message">Welcome back to AirQualityInsight</p>
  <form class="login-form" @submit.prevent="handleLogin">
    <label for="username">Username:</label>
    <input
      v-model="username"
      type="text"
      placeholder="Username"
      name="username"
      id="username"
      required
    />
    <label for="password">Password:</label>
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      name="password"
      id="password"
      required
    />
    <p v-if="getAuthError" class="error-text">
      {{ getAuthError }}
    </p>
    <button class="tertiary-color" type="submit">Login</button>
  </form>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "LoginComponent",

  data() {
    return {
      username: "",
      password: "",
    };
  },
  computed: {
    ...mapGetters("user", ["getAuthError"]),
  },

  methods: {
    ...mapActions("user", ["login"]),

    async handleLogin() {
      try {
        await this.login({
          username: this.username,
          password: this.password,
        });

        if (this.getAuthError) {
          return;
        }

        console.log("Login OK");
        this.$router.push("/");
      } catch (error) {
        console.error("Login request failed:", error);
      }
    },
  },
  watch: {
    username() {
      this.$store.commit("user/setAuthError", null);
    },
    password() {
      this.$store.commit("user/setAuthError", null);
    },
  },
};
</script>

<style lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.login-form label {
  display: none;
}

.login-form input {
  background: transparent;
  border: none;
  border-bottom: solid 2px var(--text-color);
  border-radius: 0;
  font-size: 1em;
}

.login-form button {
  border: none;
  text-align: center;
  border-radius: 8px;
  width: fit-content;
  font-size: 1em;
  padding: 0.5rem 1rem;
}

.error-text {
  color: red;
  font-size: 0.9rem;
  margin-top: 4px;

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
