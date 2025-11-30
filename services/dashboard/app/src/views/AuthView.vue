<template>
  <div div class="form-container">
    <component :is="formType" />
  </div>
</template>

<script>
import SignUpForm from "../assets/components/SignUpComponent.vue";
import LoginForm from "../assets/components/LoginComponent.vue";

export default {
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  computed: {
    formType() {
      return this.type === "sign-up" ? SignUpForm : LoginForm;
    },
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
