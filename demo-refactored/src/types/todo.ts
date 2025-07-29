export interface Todo {
  id: number
  content: string
  status: number // 0: 新建, 1: 进行中, 2: 已完成, 3: 已删除
  user_id: number
  created_at?: string
  updated_at?: string
}

export interface CreateTodoRequest {
  content: string
  token: string
}

export interface TodoResponse {
  status: boolean
  msg: string
  data?: any
}