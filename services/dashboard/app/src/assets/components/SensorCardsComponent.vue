<script>
export default {
  name: "SensorCardsComponent",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<template>
  <div class="sensor-cards-container">
    <p v-if="!data || data.length === 0" class="sensor-placeholder">
      No sensor data
    </p>

    <div v-for="sensor in data" :key="sensor.getId()" class="sensor-card">
      <ul class="sensor-info-list">
        <li class="name-li">
          <p>Sensor:</p>
          <p>{{ sensor.getName() }}</p>
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
          <p>Status:</p>
          <p>{{ sensor.getActive() }}</p>
        </li>
        <li>
          <p>Distance from center (m):</p>
          <p>{{ sensor.getDistanceFromCenter() }}</p>
        </li>
        <li>
          <p>Last measurement received:</p>
          <p>{{ sensor.getLastMeasurementReceived() }}</p>
        </li>
        <li>
          <p>Time since last measurement:</p>
          <p>{{ sensor.getTimeSinceMeasurement() }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.sensor-cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 3rem;
}

/* Card styling */
.sensor-card {
  position: relative; /* Needed for pseudo-element */
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

.sensor-info-list li p:first-child {
  font-weight: bold;
}
</style>
