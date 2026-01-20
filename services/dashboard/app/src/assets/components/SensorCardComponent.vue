<script>
import { mapActions } from "vuex";

export default {
  name: "SensorCardComponent",
  props: {
    sensor: {
      type: Object,
      required: true,
    },
  },
  methods: {
    ...mapActions("sensors", ["deleteSensor", "modifySensor"]),

    onDeleteSensor() {
      this.deleteSensor(this.sensor.getId());
    },

    onModifySensor() {
      console.log("MODIFY");
      this.isModify = true;
    },

    submitForm() {
      this.modifySensor({
        sensorId: this.sensor.getId(),
        sensorName: this.formData.name,
      });

      this.isModify = false;
    },
  },
  data() {
    return {
      isModify: false,
      formData: {
        name: this.sensor.getName(),
      },
    };
  },
};
</script>

<template>
  <div class="sensor-card">
    <button @click="$emit('close-card')">CLOSE</button>
    <ul class="sensor-info-list">
      <li>
        <p v-if="!isModify">Sensor:</p>
        <p v-if="!isModify">{{ sensor.getName() }}</p>

        <form @submit.prevent="submitForm" v-if="isModify">
          <label for="name">Sensor Name:</label>
          <input
            type="text"
            id="nameField"
            name="name"
            v-model="formData.name"
            required
          />
          <button type="submit" class="btn">Update</button>
          <button type="button" class="btn cancel" @click="isModify = false">
            Close
          </button>
        </form>
      </li>
      <li>
        <p>Latitude:</p>
        <p>{{ sensor.getLat() }}</p>
      </li>
      <li>
        <p>Longitude:</p>
        <p>{{ sensor.getLng() }}</p>
      </li>
      <li>
        <p>Status</p>
        <p>{{ sensor.getActive() }}</p>
      </li>
      <li>
        <p>Distance from center</p>
        <p>##</p>
      </li>
      <li>
        <p>Last measurement received</p>
        <p>##</p>
      </li>
      <li>
        <p>Time since last measurement</p>
        <p>##</p>
      </li>
      <li>
        <button @click="onDeleteSensor">DELETE</button>
        <button @click="onModifySensor">MODIFY</button>
      </li>
    </ul>
  </div>
</template>

<style>
.sensor-card {
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
}

.sensor-info-list {
  list-style: none;
}

.sensor-info-list li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
