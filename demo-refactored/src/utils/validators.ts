// 表单验证工具函数

export interface ValidationResult {
  valid: boolean
  errors?: Record<string, string>
}

// 登录表单验证
export function validateLoginForm(form: { username: string; password: string }): ValidationResult {
  const errors: Record<string, string> = {}

  // 用户名验证
  if (!form.username.trim()) {
    errors.username = '请输入用户名'
  } else if (form.username.length < 3) {
    errors.username = '用户名至少3个字符'
  } else if (form.username.length > 20) {
    errors.username = '用户名最多20个字符'
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(form.username)) {
    errors.username = '用户名只能包含字母、数字、下划线和中文'
  }

  // 密码验证
  if (!form.password) {
    errors.password = '请输入密码'
  } else if (form.password.length < 6) {
    errors.password = '密码至少6个字符'
  } else if (form.password.length > 50) {
    errors.password = '密码最多50个字符'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  }
}

// 待办事项表单验证
export function validateTodoForm(content: string): ValidationResult {
  const errors: Record<string, string> = {}

  if (!content.trim()) {
    errors.content = '请输入待办事项内容'
  } else if (content.length > 200) {
    errors.content = '待办事项内容最多200个字符'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  }
}

// 邮箱验证
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 手机号验证（中国大陆）
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 密码强度检查
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('密码长度至少8个字符')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('包含小写字母')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('包含大写字母')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('包含数字')
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push('包含特殊字符')
  }

  return { score, feedback }
}

// 通用字段验证
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName}不能为空`
  }
  return null
}

export function validateLength(
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): string | null {
  if (value.length < min) {
    return `${fieldName}至少${min}个字符`
  }
  if (value.length > max) {
    return `${fieldName}最多${max}个字符`
  }
  return null
}