<template>
  <div class="form-popup" id="createSensorForm" ref="sensorForm">
    <form class="form-container" @submit.prevent="submitForm">
      <h1>Create new sensor</h1>

      <label for="name">Sensor Name:</label>
      <input
        type="text"
        id="nameField"
        name="name"
        v-model="formData.name"
        required
      />

      <label for="longitudeField">Longitude:</label>
      <input
        type="text"
        id="longitudeField"
        name="longitude"
        v-model="formData.longitude"
        required
        :readonly="true"
      />

      <label for="latitudeField">Latitude:</label>
      <input
        type="text"
        id="latitudeField"
        name="latitude"
        v-model="formData.latitude"
        required
        :readonly="true"
      />

      <label for="active" class="switch">Active:</label>
      <input
        type="checkbox"
        id="checkbox"
        name="active"
        v-model="formData.active"
      />
      <span class="slider round"></span>

      <button type="submit" class="btn">Create</button>
      <button type="button" class="btn cancel" @click="$emit('close-form')">
        Close
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
};
</script>

<style>
#longitudeField:hover,
#latitudeField:hover {
  cursor: context-menu;
}
#checkbox:hover {
  cursor: pointer;
}
</style>
