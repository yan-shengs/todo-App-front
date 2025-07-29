export interface ApiResponse<T = any> {
  status: boolean
  msg: string
  data?: T
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface FilterParams {
  status?: string
  search?: string
  priority?: string
}