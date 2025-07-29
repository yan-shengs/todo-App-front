import { apiService } from './api'
import type { LoginCredentials, LoginResponse, User } from '@/types/auth'

export class AuthService {
  // 登录
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/login', credentials)
  }

  // 注册
  async register(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/register', credentials)
  }

  // 获取用户信息
  async getUserInfo(): Promise<{ status: boolean; data: User }> {
    return apiService.get('/user/info')
  }

  // 刷新token
  async refreshToken(): Promise<{ status: boolean; data: { token: string } }> {
    return apiService.post('/auth/refresh')
  }

  // 登出
  async logout(): Promise<{ status: boolean }> {
    try {
      await apiService.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    // 清除本地存储
    localStorage.removeItem('Bearer')
    return { status: true }
  }

  // 检查token是否有效
  async validateToken(): Promise<boolean> {
    try {
      const response = await apiService.get('/auth/validate')
      return response.status === true
    } catch {
      return false
    }
  }
}

export const authService = new AuthService()