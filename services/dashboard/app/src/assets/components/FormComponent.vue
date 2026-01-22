<template>
  <div class="form-popup surface-color" id="createSensorForm" ref="sensorForm">
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
        <label for="active" class="switch">Active:</label>
        <input
          type="checkbox"
          id="checkbox"
          name="active"
          v-model="formData.active"
        />
        <span class="slider round"></span>
      </div>

      <div class="form-buttons">
        <button type="submit" class="btn tertiary-color">Create</button>
        <button
          type="button"
          class="btn cancel tertiary-color"
          @click="$emit('close-form')"
        >
          Close
        </button>
      </div>
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
.form-popup {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 1 / 4 / 4;
  z-index: 2;
  padding: 0 1rem 1rem 1rem;
  overflow-y: auto;
  border-radius: 8px;

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 50%;
    align-self: center;
    font-size: 1em;
  }

  .form-content,
  .form-buttons {
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

  .form-buttons {
    gap: 1rem;
    margin: 1rem 0;
    justify-content: flex-end;
  }

  #longitudeField:hover,
  #latitudeField:hover {
    cursor: context-menu;
  }
  #checkbox:hover {
    cursor: pointer;
  }
}
</style>
