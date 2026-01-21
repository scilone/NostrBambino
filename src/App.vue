<script setup>
import { computed } from 'vue'
import { useAppStore } from './stores/appStore'
import PairingView from './views/PairingView.vue'
import SwipingView from './views/SwipingView.vue'

const store = useAppStore()
const currentView = computed(() => store.isPaired ? 'swiping' : 'pairing')
</script>

<template>
  <div id="app">
    <PairingView v-if="currentView === 'pairing'" />
    <SwipingView v-else />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
}
</style>
