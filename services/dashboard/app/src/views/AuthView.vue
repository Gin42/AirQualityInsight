<template>
  <div class="form-container">
    <LoginComponent></LoginComponent>
  </div>
</template>

<script>
import LoginComponent from "@/assets/components/LoginComponent.vue";

export default {
  name: "AuthView",
  components: {
    LoginComponent,
  },
};
</script>

<style lang="scss">
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.5em;
}
</style>
