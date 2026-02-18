<script>
import { mapActions, mapGetters } from "vuex";
export default {
  name: "SensorCardsComponent",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters("user", ["getUsername"]),
  },
  methods: {
    ...mapActions("sensors", [
      "deleteSensor",
      "modifySensor",
      "updateSensorStatus",
    ]),

    async onDeleteSensor(sensor) {
      this.isDeleting = true;
      await this.deleteSensor(sensor.getId());
      this.$emit("delete-sensor");
      this.isDeleting = false;
    },

    onModifySensor(name) {
      this.isModify = true;
      this.formData.name = name;
    },

    submitForm(sensor) {
      this.modifySensor({
        sensorId: sensor.getId(),
        sensorName: this.formData.name,
      });

      this.isModify = false;
    },

    onToggleSensorStatus(sensor, event) {
      const active = event.target.checked;

      this.updateSensorStatus({
        sensorId: sensor.getId(),
        active,
      });
    },
  },
  data() {
    return {
      isModify: false,
      formData: {
        name: null,
      },
      isDeleting: false,
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
              @click="onModifySensor(sensor.getName())"
              v-if="selected === true && getUsername != null"
            >
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
          </div>

          <form
            class="name-form"
            @submit.prevent="submitForm(sensor)"
            v-if="isModify"
          >
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

          <label class="switch btn-switch btn-active-switch" @click.stop>
            <input
              type="checkbox"
              id="sensor_active"
              name="sensor_active"
              @click="onToggleSensorStatus(sensor, $event)"
              :checked="sensor.getActive()"
              :disabled="!getUsername"
            />
            <span class="btn-switch-inner btn-active-switch-inner"></span>
            <span class="btn-switch-circle btn-active-switch-circle"></span>
          </label>
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
        <li class="delete-li" v-if="selected === true && getUsername != null">
          <button
            class="sensor-action-btn danger-color"
            @click="onDeleteSensor(sensor)"
          >
            <i class="fa-solid fa-circle-notch" v-if="isDeleting"></i>
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
  inset: 0;
  background: url("../icons/pushpinVectorCard.svg") no-repeat left center;
  background-size: auto 80%;
  opacity: 0.15;
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
  z-index: 100;
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

.btn-active-switch-inner {
  background-color: var(--danger-color);
}

/* When checked, track becomes success */
.btn-active-switch input:checked + .btn-active-switch-inner {
  background-color: var(--success-color);
}

.btn-active-switch input:checked ~ .btn-active-switch-circle {
  transform: translateX(26px);
}
</style>
