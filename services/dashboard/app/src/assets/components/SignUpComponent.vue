<template>
  <p class="message">Welcome to AirQualityInsight</p>
  <form class="register-form" @submit.prevent="handleRegister">
    <label for="username">Username:</label>
    <input
      v-model="username"
      type="text"
      placeholder="Username"
      name="username"
      required
    />
    <label for="password">Password:</label>
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      name="password"
      required
    />
    <button class="tertiary-color" type="submit">Register</button>
  </form>
</template>

<script>
import { mapActions, mapState } from "vuex";
export default {
  name: "SignUpForm",

  data() {
    return {
      username: "",
      password: "",
    };
  },

  methods: {
    ...mapActions("user", ["register", "login"]),

    handleRegister() {
      this.register({
        username: this.username,
        password: this.password,
      })
        .then((response) => {
          console.log(response);
          console.log("Registration OK");
        })
        .catch((error) => {
          console.error("Registration failed:", error);
        });
    },
  },
};
</script>

<style lang="scss">
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.register-form label {
  display: none;
}

.register-form input {
  background: transparent;
  border: none;
  border-bottom: solid 2px var(--text-color);
  border-radius: 0;
  font-size: 1em;
}

.register-form button {
  border: none;
  text-align: center;
  border-radius: 8px;
  width: fit-content;
  font-size: 1em;
  padding: 0.5rem 1rem;
}
</style>
