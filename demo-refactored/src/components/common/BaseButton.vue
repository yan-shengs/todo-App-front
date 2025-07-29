<template>
  <button
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--loading': loading, 'base-button--disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <!-- 保持原有的加载动画风格 -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  loading: false,
  disabled: false
})

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.base-button {
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  outline: none;
  text-decoration: none;
  font-family: inherit;
}

/* 尺寸 */
.base-button--small {
  padding: 6px 12px;
  font-size: 14px;
  height: 32px;
  min-width: 64px;
}

.base-button--medium {
  padding: 12px 24px;
  font-size: 16px;
  height: 44px;
  min-width: 88px;
}

.base-button--large {
  padding: 16px 32px;
  font-size: 18px;
  height: 56px;
  min-width: 120px;
}

/* 主要样式 - 保持原有渐变 */
.base-button--primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 2px 8px rgba(161, 140, 209, 0.12);
}

.base-button--primary:hover:not(.base-button--disabled) {
  background: var(--primary-gradient-hover);
  box-shadow: 0 4px 16px rgba(161, 140, 209, 0.18);
  transform: translateY(-2px) scale(1.03);
}

.base-button--secondary {
  background: #f8f8ff;
  color: var(--primary-color);
  border: 1.5px solid var(--border-color);
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background: #f3eaff;
  border-color: var(--primary-light);
  transform: translateY(-1px);
}

.base-button--danger {
  background: linear-gradient(90deg, #e53e3e 0%, #c53030 100%);
  color: white;
}

.base-button--danger:hover:not(.base-button--disabled) {
  background: linear-gradient(90deg, #c53030 0%, #e53e3e 100%);
  transform: translateY(-1px);
}

.base-button--ghost {
  background: transparent;
  color: var(--primary-color);
  border: 1.5px solid var(--primary-light);
}

.base-button--ghost:hover:not(.base-button--disabled) {
  background: var(--focus-color);
  transform: translateY(-1px);
}

/* 状态 */
.base-button--loading,
.base-button--disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none !important;
}

/* 加载动画 */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .base-button {
    min-width: auto;
  }
  
  .base-button--small {
    padding: 8px 12px;
  }
  
  .base-button--medium {
    padding: 10px 20px;
  }
  
  .base-button--large {
    padding: 12px 24px;
  }
}
</style>