<template>
  <header class="app-header">
    <div class="header-content">
      <!-- 左侧：Logo -->
      <div class="header-left">
        <router-link to="/todos" class="logo">
          <h1 class="logo-text">Todo App</h1>
        </router-link>
      </div>

      <!-- 右侧：用户操作 -->
      <div class="header-right">
        <nav class="nav-menu">
          <router-link to="/todos" class="nav-item">
            待办事项
          </router-link>
          <router-link to="/profile" class="nav-item">
            个人中心
          </router-link>
        </nav>

        <div class="user-actions">
          <span class="user-name">{{ authStore.user?.username }}</span>
          <BaseButton 
            variant="ghost" 
            size="small" 
            @click="handleLogout"
            :loading="authStore.isLoading"
          >
            退出登录
          </BaseButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(161, 140, 209, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  text-decoration: none;
}

.logo-text {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-menu {
  display: flex;
  gap: 24px;
}

.nav-item {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--focus-color);
  color: var(--primary-color);
}

.nav-item.router-link-active {
  background: var(--primary-gradient);
  color: white;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
  color: var(--text-color);
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .header-right {
    gap: 16px;
  }
  
  .nav-menu {
    display: none;
  }
  
  .user-name {
    display: none;
  }
}
</style>