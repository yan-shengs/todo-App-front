import { apiService } from './api'
import type { Todo, CreateTodoRequest } from '@/types/todo'
import type { ApiResponse } from '@/types/api'

export class TodoService {
  private readonly baseUrl = '/todos'

  // 获取待办事项列表
  async getTodos(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }): Promise<ApiResponse<Todo[]>> {
    return apiService.get(this.baseUrl, { params })
  }

  // 获取单个待办事项
  async getTodoById(id: number): Promise<ApiResponse<Todo>> {
    return apiService.get(`${this.baseUrl}/${id}`)
  }

  // 创建待办事项
  async createTodo(data: CreateTodoRequest): Promise<ApiResponse<Todo>> {
    return apiService.post(this.baseUrl, data)
  }

  // 更新待办事项
  async updateTodo(id: number, data: Partial<Todo>): Promise<ApiResponse<Todo>> {
    return apiService.put(`${this.baseUrl}/${id}`, data)
  }

  // 删除待办事项
  async deleteTodo(id: number): Promise<ApiResponse<void>> {
    return apiService.delete(`${this.baseUrl}/${id}`)
  }

  // 切换完成状态
  async toggleTodo(id: number): Promise<ApiResponse<Todo>> {
    return apiService.post(`${this.baseUrl}/${id}/toggle`)
  }

  // 批量操作
  async batchUpdate(ids: number[], updates: Partial<Todo>): Promise<ApiResponse<Todo[]>> {
    return apiService.put(`${this.baseUrl}/batch`, { ids, updates })
  }

  // 获取统计信息
  async getStats(): Promise<ApiResponse<{
    total: number
    completed: number
    pending: number
  }>> {
    return apiService.get(`${this.baseUrl}/stats`)
  }
}

export const todoService = new TodoService()