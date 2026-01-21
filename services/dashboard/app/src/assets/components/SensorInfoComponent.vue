<script>
import { mapActions } from "vuex";

export default {
  name: "SensorInfoComponent",
  props: {
    sensor: {
      type: Object,
      default: null,
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
        name: null,
      },
    };
  },
  watch: {
    sensor: {
      immediate: true,
      handler(newSensor) {
        if (newSensor) {
          this.formData.name = newSensor.getName();
          this.isModify = false; // reset edit mode on sensor change
        } else {
          this.formData.name = null;
        }
      },
    },
  },
};
</script>

<template>
  <div class="sensor-info">
    <button class="icon-button" @click="$emit('close-info')">
      <i class="fa-solid fa-xmark"></i>
    </button>

    <ul class="sensor-info-list" v-if="sensor">
      <li class="name-li">
        <p v-if="!isModify">Sensor:</p>

        <div class="name-li-wrapper" v-if="!isModify">
          <p>{{ sensor.getName() }}</p>
          <button class="icon-button modify" @click="onModifySensor">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
        </div>

        <form class="name-form" @submit.prevent="submitForm" v-if="isModify">
          <label class="label" for="name">Sensor:</label>
          <input
            type="text"
            id="nameField"
            name="name"
            v-model="formData.name"
            required
          />
          <div class="form-buttons">
            <button class="icon-button" type="submit">
              <i class="fa-solid fa-check"></i>
            </button>
            <button type="button" class="icon-button" @click="isModify = false">
              <i class="fa-solid fa-x"></i>
            </button>
          </div>
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
        <p>Distance from center (m)</p>
        <p>{{ sensor.getDistanceFromCenter() }}</p>
      </li>
      <li>
        <p>Last measurement received</p>
        <p>{{ sensor.getLastMeasurementReceived() }}</p>
      </li>
      <li>
        <p>Time since last measurement</p>
        <p>{{ sensor.getTimeSinceMeasurement() }}</p>
      </li>
      <hr />
      <li class="delete-li">
        <button class="sensor-action-btn danger-color" @click="onDeleteSensor">
          DELETE
        </button>
      </li>
    </ul>

    <p v-else class="sensor-placeholder">Click on a marker to show its info</p>
  </div>
</template>

<style>
.sensor-info {
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  grid-area: 1 / 1 / 4 / 4;
  z-index: 2;
  padding: 0 1rem 1rem 1rem;
  border: 2px solid black;
}

.sensor-info-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.sensor-info-list p {
  margin: 0.5rem 0;
}

.sensor-info-list li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 1em;
}

.sensor-info-list li p:first-child,
.label {
  font-weight: bold;
}

.modify {
  align-self: center;
  margin: 0 0.3rem;
}

#nameField {
  width: 100%;
  margin: 0 0.5rem;
  font-size: 1em;
}

.name-form,
.form-buttons {
  display: flex;
  flex-direction: row;
}

.name-form {
  width: 100%;
  justify-content: space-evenly;
  align-items: center;
}

.name-li-wrapper {
  display: flex;
  flex-direction: row;
  text-align: center;
}

.name-li-wrapper p {
  font-weight: normal !important;
}

.sensor-action-btn {
  color: white;
  padding: 0.5rem;
  font-size: 1em;
  height: fit-content;
  width: fit-content;
}

li.delete-li {
  justify-content: end;
}

@media (min-width: 800px) {
  .sensor-info {
    grid-area: 1 / 3 / 4 / 4;
  }
}
</style>
