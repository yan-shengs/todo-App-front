import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import '@/styles/variables.css'

const app = createApp(App)

// 安装插件
app.use(createPinia())
app.use(router)

// 挂载应用
app.mount('#app')