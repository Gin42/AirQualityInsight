<script>
export default {
  name: "MapButtonComponent",
};
</script>

<template>
  <div class="btn-group-map">
    <button class="btn-map tertiary-color" @click="$emit('open-settings')">
      <i class="fa-solid fa-gear"></i>
    </button>
    <button class="btn-map tertiary-color">
      <i class="fa-solid fa-map-location-dot"></i>
    </button>
    <button class="btn-map tertiary-color" @click="$emit('open-info')">
      <i class="fa-solid fa-map-pin"></i>
    </button>
  </div>
</template>

<style>
.btn-group-map {
  display: flex;
  flex-direction: row;
  align-items: center;
  grid-area: 3 / 2 / 4 / 3;
  z-index: 1;
  justify-self: center;
  align-self: end;
  padding-bottom: 3rem;
}

.btn-group-map :nth-child(1) {
  border-radius: 8px 0px 0px 8px;
}

.btn-group-map :nth-child(2) {
  border-radius: 0px;
}

.btn-group-map :nth-child(3) {
  border-radius: 0px 8px 8px 0px;
}

.btn-map {
  width: 3rem;
  height: 3rem;
  padding: 0.5rem;
}

.btn-map * {
  font-size: 1.5em;
  color: white;
}
</style>
