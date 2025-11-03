<script setup>
import router from "@/router";
import { ref } from "vue";
let open = ref(false);
</script>

<template>
  <div :class="['topnav', open ? 'open' : 'close']" ref="topNav">
    <div class="menu-button interact">
      <a @click.prevent="open = !open">
        <i class="fa fa-bars fa-xl" v-show="!open"></i>
        <i class="fa-solid fa-xmark fa-xl" v-show="open"></i>
      </a>
    </div>
    <ul class="links" v-if="open">
      <li class="list-item interact">
        <router-link href="#home">
          <i class="fa-solid fa-house icon fa-xl"></i>
          <p>Home</p>
        </router-link>
      </li>
      <li class="list-item interact">
        <router-link href="#map">
          <i class="fa-solid fa-map icon fa-xl"></i>
          <p>Map</p>
        </router-link>
      </li>
      <li class="list-item interact">
        <router-link href="#stats"
          ><i class="fa-solid fa-chart-line icon fa-xl"></i>
          <p>Statistics</p>
        </router-link>
      </li>
      <li class="list-item interact">
        <router-link href="#liveEAQI"
          ><i class="fa-solid fa-tower-broadcast icon fa-xl"></i>
          <p>Live EAQI</p>
        </router-link>
      </li>
      <li class="list-item interact">
        <router-link href="#last"
          ><i class="fa-solid fa-ruler icon fa-xl"></i>
          <p>Last measurement</p>
        </router-link>
      </li>
    </ul>
  </div>
  <!-- "Hamburger menu" / "Bar icon" to toggle the navigation links -->
</template>

<style>
.topnav {
  overflow: hidden;
  background-color: #8fb8ed;
  position: fixed;
  width: -webkit-fill-available;
  height: 3rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
}

.topnav .menu-button {
  border-radius: 50%;
  width: 1.5em;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topnav .links {
  display: block;
  position: fixed;
  width: max-content;
  height: -webkit-fill-available;
  background: #8fb8ed;
  top: 3rem;
  left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.topnav .list-item {
  padding: 0.7rem 1rem;
}

.topnav .interact:hover {
  background-color: #88afe1;
  cursor: pointer;
}

.topnav .list-item > a {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;
}

i.icon {
  padding-right: 1rem;
  color: black;
}

p {
  color: black;
}

.hide {
  display: none;
}

.show {
  display: block;
}
</style>
