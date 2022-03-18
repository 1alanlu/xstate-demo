<script setup lang="ts">
import { useToggleMachine } from '~/machines/toggle';

const { state, send } = useToggleMachine();
</script>

<template>
  <h4>ToggleMachine</h4>
  <div>State: {{ state.value }}</div>
  <div>Context: {{ state.context }}</div>
  <div m-5>
    <button btn @click="send('TOGGLE')">
      {{ state.matches('inactive') ? 'activate' : 'deactivate' }}
    </button>
  </div>
</template>

<route lang="yaml">
meta:
  layout: machine
</route>
