<template>
  <div class="form-popup" id="createSensorForm" ref="sensorForm">
    <form class="form-container" @submit.prevent="submitForm">
      <h1>Create new sensor</h1>

      <label for="name">Sensor Name:</label>
      <input
        type="text"
        placeholder="Ex. sensor address"
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
        name="active"
        v-model="formData.active"
        id="checkbox"
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
export default {
  props: {
    initialLongitude: {
      type: Number,
      required: true,
    },
    initialLatitude: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      formData: {
        name: "",
        latitude: this.initialLatitude,
        longitude: this.initialLongitude,
        active: true,
      },
    };
  },
  methods: {
    submitForm() {
      this.$emit("submit-form", this.formData);
      this.resetForm();
    },
    resetForm() {
      this.formData.name = "";
      this.formData.latitude = this.initialLatitude;
      this.formData.longitude = this.initialLongitude;
      this.formData.active = false;
    },
  },
  watch: {
    initialLatitude(newLat) {
      this.formData.latitude = newLat;
    },
    initialLongitude(newLng) {
      this.formData.longitude = newLng;
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
