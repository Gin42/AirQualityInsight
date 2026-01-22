<script>
import { mapActions } from "vuex";
export default {
  name: "SensorCardsComponent",
  props: {
    data: {
      type: Array,
      default: () => [],
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
};
</script>

<template>
  <div class="sensor-cards-container">
    <p v-if="!data || data.length === 0" class="sensor-placeholder">
      No sensor data
    </p>

    <div
      v-for="sensor in data"
      :key="sensor.getId()"
      class="sensor-card bg-color"
      @click="$emit('select-sensor', sensor)"
    >
      <ul class="sensor-info-list">
        <li class="name-li">
          <p v-if="!isModify">Sensor:</p>

          <div class="name-li-wrapper" v-if="!isModify">
            <p>{{ sensor.getName() }}</p>
            <button
              class="icon-button modify"
              @click="onModifySensor"
              v-if="data.length === 1"
            >
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
              <button
                type="button"
                class="icon-button"
                @click="isModify = false"
              >
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
        <li class="delete-li" v-if="data.length === 1">
          <button
            class="sensor-action-btn danger-color"
            @click="onDeleteSensor"
          >
            DELETE
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.sensor-cards-container {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

.sensor-cards-container p {
  margin: 0.4rem 0;
}

/* Card styling */
.sensor-card {
  position: relative; /* Needed for pseudo-element */
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
}

.sensor-card::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 90%;
  background-color: #3590f3;
  mask: url("../pushpinVector.svg") no-repeat left;
  -webkit-mask: url("../pushpinVector.svg") no-repeat left;
  mask-size: auto;
  -webkit-mask-size: contain;
  opacity: 0.2;
  pointer-events: none;
}

/* List inside the card */
.sensor-info-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.sensor-info-list li {
  display: flex;
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
</style>
