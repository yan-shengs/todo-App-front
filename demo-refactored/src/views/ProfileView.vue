<template>
  <div class="profile-view">
    <AppHeader />
    <div class="profile-container">
      <h1>个人资料</h1>
      <div class="profile-content">
        <p>个人资料功能开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>