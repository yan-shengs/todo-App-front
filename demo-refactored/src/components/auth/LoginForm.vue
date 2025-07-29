<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">{{ isLoginMode ? '登录' : '注册' }}</h2>
        <p class="login-subtitle">{{ isLoginMode ? '欢迎回来！' : '开始您的待办之旅' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <BaseInput
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名"
          :error="errors.username"
          :disabled="authStore.isLoading"
          required
        />

        <BaseInput
          v-model="form.password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :error="errors.password"
          :disabled="authStore.isLoading"
          required
        />

        <BaseButton
          type="submit"
          :loading="authStore.isLoading"
          class="login-button"
          size="large"
        >
          {{ isLoginMode ? '登录' : '注册' }}
        </BaseButton>
      </form>

      <!-- 切换模式 -->
      <div class="mode-switch">
        <p class="switch-text">
          {{ isLoginMode ? '还没有账号？' : '已有账号？' }}
          <button 
            type="button"
            @click="toggleMode" 
            class="switch-button"
            :disabled="authStore.isLoading"
          >
            {{ isLoginMode ? '立即注册' : '立即登录' }}
          </button>
        </p>
      </div>

      <!-- 关闭按钮 - 保持原有风格 -->
      <button 
        type="button"
        @click="$emit('close')" 
        class="close-button"
        :disabled="authStore.isLoading"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          fill="currentColor" 
          viewBox="0 0 16 16"
        >
          <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z"/>
          <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z"/>
        </svg>
      </button>
    </div>

    <!-- 错误提示 - 保持原有浮窗风格 -->
    <Transition name="fade">
      <div v-if="authStore.error" class="error-toast">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#e53e3e" />
          <path d="M10 5v5" stroke="#fff" stroke-width="2" stroke-linecap="round" />
          <circle cx="10" cy="14" r="1" fill="#fff" />
        </svg>
        <span>{{ authStore.error }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { validateLoginForm } from '@/utils/validators'

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const isLoginMode = ref(true)

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

let errorTimer: number | null = null

// 清除错误信息
function clearErrors() {
  errors.username = ''
  errors.password = ''
}

// 表单验证
function validateForm() {
  clearErrors()
  const validation = validateLoginForm(form)
  
  if (!validation.valid && validation.errors) {
    Object.assign(errors, validation.errors)
    return false
  }
  
  return true
}

// 切换登录/注册模式
function toggleMode() {
  isLoginMode.value = !isLoginMode.value
  clearErrors()
  authStore.clearError()
}

// 提交表单
async function handleSubmit() {
  if (!validateForm()) return

  const result = isLoginMode.value 
    ? await authStore.login(form)
    : await authStore.register(form)

  if (result.success) {
    emit('success')
  }
}

// 监听错误信息，自动清除
watch(() => authStore.error, (newError) => {
  if (newError) {
    if (errorTimer) {
      clearTimeout(errorTimer)
    }
    errorTimer = window.setTimeout(() => {
      authStore.clearError()
    }, 3000)
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (errorTimer) {
    clearTimeout(errorTimer)
  }
})
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.login-card {
  position: relative;
  width: 90vw;
  max-width: 420px;
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid #eee;
  box-shadow: var(--card-shadow);
  padding: 40px 32px 32px;
  animation: fadeIn 0.7s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  margin: 0 0 8px 0;
  color: var(--primary-color);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
}

.login-subtitle {
  margin: 0;
  color: var(--text-light);
  font-size: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-button {
  width: 100%;
  margin-top: 8px;
}

.mode-switch {
  margin-top: 24px;
  text-align: center;
}

.switch-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-light);
}

.switch-button {
  background: none;
  border: none;
  color: var(--primary-light);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 4px;
  transition: color 0.2s ease;
}

.switch-button:hover:not(:disabled) {
  color: var(--primary-color);
}

.switch-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-light);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover:not(:disabled) {
  background: #f0f0f0;
  color: var(--primary-color);
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 错误提示浮窗 */
.error-toast {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff5f5;
  border-left: 4px solid var(--error-color);
  color: var(--error-color);
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(229, 62, 62, 0.08);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2001;
  animation: slideIn 0.3s ease;
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    width: 95vw;
    padding: 32px 24px 24px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .login-subtitle {
    font-size: 14px;
  }
}
</style>