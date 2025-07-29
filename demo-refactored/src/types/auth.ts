export interface User {
  id: number
  username: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginResponse {
  status: boolean
  msg: string
  data: AuthResponse
}