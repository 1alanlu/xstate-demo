<script setup lang="ts">
import { useFetchMachine } from '~/machines/fetchRestaurant';

const { state, send } = useFetchMachine();
</script>

<template>
  <h4>Fetch Restaurant Machine</h4>
  <div>State: {{ state.value }}</div>
  <button btn :disabled="!(state.matches('ready') || state.matches('initial'))" @click="send('FETCH')">Fetch</button>
  <button btn :disabled="!state.matches('failure')" @click="send('RETRY')">Retry</button>
  <div>
    <div>Context: {{ state.context }}</div>
    <span v-show="state.matches('loading')">...Loading...</span>

    <div v-if="state.matches('ready') || state.matches('success') || state.matches('loading')">
      <!-- success and ready both have Restaurant[] -->
      <div v-for="restaurant in state.context.restaurants" :key="restaurant.id">
        <h3>{{ restaurant.name }}</h3>
        <p>Rating - {{ restaurant.rating }} stars</p>
        <p>{{ restaurant.review }}</p>
      </div>
    </div>

    <div v-if="state.matches('failure')">
      <h4>Error loading restaurants</h4>
      <p>{{ state.context.error.message }}</p>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: machine
</route>
