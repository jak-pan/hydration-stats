<template>
  <div id="app">
    <Layout>
      <router-view />
    </Layout>
  </div>
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue'
</script>

<style>
#app {
  font-family: var(--font-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>