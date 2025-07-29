import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import type { User, LoginCredentials } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('Bearer'))
  const isLoading = ref(false)
  const error = ref<string>('')

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 操作
  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await authService.login(credentials)
      
      if (response.status) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('Bearer', response.data.token)
        return { success: true }
      } else {
        error.value = response.msg || '登录失败'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.msg || '网络错误，请重试'
      error.value = errorMsg
      return { success: false, error: errorMsg }
    } finally {
      isLoading.value = false
    }
  }

  async function register(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await authService.register(credentials)
      
      if (response.status) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('Bearer', response.data.token)
        return { success: true }
      } else {
        error.value = response.msg || '注册失败'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.msg || '注册失败，请重试'
      error.value = errorMsg
      return { success: false, error: errorMsg }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    
    try {
      await authService.logout()
    } finally {
      // 无论服务端是否成功，都清除本地状态
      token.value = null
      user.value = null
      localStorage.removeItem('Bearer')
      isLoading.value = false
      error.value = ''
    }
  }

  // 初始化时检查token
  async function initAuth() {
    const storedToken = localStorage.getItem('Bearer')
    if (storedToken) {
      token.value = storedToken
      try {
        // 可以调用API验证token并获取用户信息
        const isValid = await authService.validateToken()
        if (!isValid) {
          await logout()
        }
      } catch {
        await logout()
      }
    }
  }

  // 清除错误信息
  function clearError() {
    error.value = ''
  }

  return {
    // 状态
    user,
    token,
    isLoading,
    error,
    // 计算属性
    isAuthenticated,
    // 操作
    login,
    register,
    logout,
    initAuth,
    clearError
  }
})