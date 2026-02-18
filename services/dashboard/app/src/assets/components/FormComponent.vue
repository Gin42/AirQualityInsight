<template>
  <div
    class="form-popup surface-color"
    id="createSensorForm"
    ref="sensorForm"
    @click.stop
  >
    <button class="icon-button" @click="$emit('close-form')">
      <i class="fa-solid fa-xmark"></i>
    </button>

    <form class="form-container" @submit.prevent="submitForm">
      <h2>Create new sensor</h2>

      <div class="form-content">
        <label for="name">Sensor name:</label>
        <input
          type="text"
          id="nameField"
          name="name"
          v-model="formData.name"
          required
        />
      </div>

      <div class="form-content">
        <label for="latitudeField">Latitude:</label>
        <input
          type="text"
          id="latitudeField"
          name="latitude"
          v-model="formData.latitude"
          required
          :readonly="true"
        />
      </div>

      <div class="form-content">
        <label for="longitudeField">Longitude:</label>
        <input
          type="text"
          id="longitudeField"
          name="longitude"
          v-model="formData.longitude"
          required
          :readonly="true"
        />
      </div>

      <div class="form-content">
        <label for="active">Active:</label>
        <input
          type="checkbox"
          id="checkbox"
          name="active"
          v-model="formData.active"
        />
      </div>

      <button type="submit" class="btn tertiary-color submit-form-button">
        Create
      </button>
    </form>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "FormComponent",
  props: {
    initialLongitude: {
      type: Number,
      required: true,
    },
    initialLatitude: {
      type: Number,
      required: true,
    },
    initialName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      formData: {
        name: this.initialName,
        latitude: this.initialLatitude,
        longitude: this.initialLongitude,
        active: true,
      },
    };
  },
  methods: {
    ...mapActions("sensors", ["addSensor"]),
    submitForm() {
      this.addSensor(this.formData);
      this.resetForm();
      this.$emit("close-form");
    },
    resetForm() {
      this.formData.name = this.initialName;
      this.formData.latitude = this.initialLatitude;
      this.formData.longitude = this.initialLongitude;
    },
    handleClickOutside(event) {
      if (!this.$refs.sensorForm.contains(event.target)) {
        this.$emit("close-form");
      }
    },
  },
  watch: {
    initialLatitude(newLat) {
      this.formData.latitude = newLat;
    },
    initialLongitude(newLng) {
      this.formData.longitude = newLng;
    },
    initialName(newName) {
      this.formData.name = newName;
    },
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        document.addEventListener("click", this.handleClickOutside);
      }, 0);
    });
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style>
.form-popup {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 1 / 4 / 4;
  z-index: 2;
  padding: 1rem;
  padding-top: 0;
  border-radius: 16px;
  width: 80%;
  height: max-content;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  justify-self: center;
  align-self: center;

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: -webkit-fill-available;
    align-self: center;
    font-size: 1em;
  }

  .form-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .form-container label {
    font-weight: bold;
  }

  .form-container input {
    width: 70% !important;
    margin: 0 !important;
  }

  .form-container input[type="text"] {
    background-color: --surface-color;
  }

  #longitudeField:hover,
  #latitudeField:hover {
    cursor: context-menu;
  }
  #checkbox:hover {
    cursor: pointer;
  }

  .submit-form-button {
    margin-top: 1rem;
  }
}
</style>
