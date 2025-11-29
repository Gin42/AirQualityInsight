<template>
  <p>{{ this.username ? this.username : "Guest" }}</p>

  <div class="register-container">
    <form @submit.prevent="handleRegister">
      <input v-model="username" type="text" placeholder="Username" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "AuthView",
  computed: {
    ...mapState({
      user: (state) => state.user.user,
    }),
  },
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
          console.log("Registration OK");
        })
        .catch((error) => {
          console.error("Registration failed:", error);
        });
    },
  },
};
</script>
