<template>
  <div class="todo-view">
    <AppHeader />
    <div class="todo-container">
      <h1>待办事项</h1>
      <div class="todo-content">
        <p>待办事项功能开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped>
.todo-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.todo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.todo-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>