<script setup lang="ts">
import { defineProps,defineEmits } from 'vue';

// 使用类型方式定义 props，更清晰
const props = defineProps<{
  isLoginStatus: boolean
}>()

// 或者采用解包的形式

defineEmits(["changeLoginStatus","changeRigsterStatus","isUserInfo"])
// defineEmits(["changeRigsterStatus"]) 只能调用一次

</script>

<template>
  <!-- 使用合法的 filter 值，blur 不允许为负数 -->
  <div id="container"
       :style="{ filter: !props.isLoginStatus ? 'blur(4px) grayscale(0.2) brightness(0.8)' : 'none' }">

    <!-- 左侧：Logo 或系统名称 -->
    <div class="nav-left">
      <span class="logo-text">MyApp</span>
    </div>
    <div id="buck"></div>
    <div id="nav-right">
      <!-- 中间：导航链接 -->
      <div class="nav-center" >
        <template v-if="props.isLoginStatus">
          <div class="nav-item" @click="$emit('changeLoginStatus')">登录</div>
          <div class="nav-item" @click="$emit('changeRigsterStatus')">注册</div>
        </template>
      </div>

      <!-- 右侧：登录后显示的内容 -->
      <div class="nav-right" >
        <!-- v-if="props.isLoginStatus" 需要给template一个逻辑控制否则直接不渲染 -->
        <template v-if="props.isLoginStatus">
          <div @click="$emit('isUserInfo')" class="nav-item">用户信息</div>
          <div class="nav-item">导出</div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
#container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 50px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 20px;
  z-index: 1000;
  transition: filter 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

#buck{
  flex:1;
}

#nav-right{
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

/* 子区域统一布局结构 */
.nav-left,
.nav-center,
.nav-right {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 控制每个区域的最小宽度避免拥挤 */
.nav-left {
  min-width: 100px;
}
.nav-center {
  flex: 1;
  min-width: 100px
  /* justify-content: center; */
}
.nav-right {
  min-width: 200px;
  /* justify-content: flex-end; */
}

/* 公共导航项样式 */
.nav-item {
  padding: 6px 12px;
  background: linear-gradient(90deg, #ba36dd 0%, #6d36dd 100%);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.nav-item:hover {
  background: linear-gradient(90deg, #a02fd9 0%, #5c2fd9 100%);
}

.logo-text {
  font-weight: bold;
  font-size: 18px;
  color: #6d36dd;
}
</style>
