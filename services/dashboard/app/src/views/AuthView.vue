<template>
  <div class="form-wrapper">
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
.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.5em;
  height: 100%;
  justify-content: center;
}
</style>
