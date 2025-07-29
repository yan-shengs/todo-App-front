<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="inputId" class="input-label">{{ label }}</label>
    <div class="input-container">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="[
          'base-input',
          { 'base-input--error': hasError, 'base-input--disabled': disabled }
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keyup.enter="$emit('enter')"
      />
      <!-- 保持原有的图标样式 -->
      <div v-if="hasError" class="input-icon error-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="8" fill="#e53e3e"/>
          <path d="M8 4v4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="8" cy="11" r="1" fill="#fff"/>
        </svg>
      </div>
    </div>
    <div v-if="hasError" class="error-message">{{ error }}</div>
    <div v-else-if="helper" class="helper-message">{{ helper }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: string
  type?: 'text' | 'password' | 'email' | 'number'
  label?: string
  placeholder?: string
  error?: string
  helper?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  focus: []
  enter: []
}>()

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)
const hasError = computed(() => !!props.error)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleBlur() {
  emit('blur')
}

function handleFocus() {
  emit('focus')
}
</script>

<style scoped>
.base-input-wrapper {
  width: 100%;
}

.input-label {
  display: block;
  margin-bottom: 6px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-light);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.base-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  background: white;
  color: var(--text-color);
  transition: all 0.2s ease;
  outline: none;
  box-shadow: 0 1px 2px rgba(161, 140, 209, 0.08);
}

.base-input:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 2px var(--focus-color);
}

.base-input--error {
  border-color: var(--error-color);
}

.base-input--error:focus {
  box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.1);
}

.base-input--disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  right: 12px;
  pointer-events: none;
}

.error-icon {
  color: var(--error-color);
}

.error-message {
  margin-top: 6px;
  font-size: 14px;
  color: var(--error-color);
  display: flex;
  align-items: center;
  gap: 4px;
}

.helper-message {
  margin-top: 6px;
  font-size: 14px;
  color: #666;
}

/* 密码输入框样式 */
.base-input[type="password"] {
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

/* 响应式 */
@media (max-width: 768px) {
  .base-input {
    padding: 10px 14px;
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .input-label {
    font-size: 15px;
  }
}
</style>