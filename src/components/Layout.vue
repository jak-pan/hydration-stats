<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content">
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 60px; /* Start with collapsed sidebar width */
  background: var(--surface-background);
  transition: margin-left 0.3s ease;
}

.content-wrapper {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: var(--spacing-l);
  }
}
</style>