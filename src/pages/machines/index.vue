<template>
  <router-link class="icon-btn mx-2" to="/machines/toggle" title="toggle"> toggle </router-link>
  <router-link class="icon-btn mx-2" to="/machines/fetchRestaurant" title="fetchRestaurant">
    fetchRestaurant
  </router-link>
  <router-link class="icon-btn mx-2" to="/machines/trafficLight" title="trafficLight"> trafficLight </router-link>
</template>

<route lang="yaml">
meta:
  layout: machine
</route>
