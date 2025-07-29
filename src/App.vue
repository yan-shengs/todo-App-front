<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import axios from 'axios'
import Basiclayouts from './components/Basiclayouts.vue'
import * as echarts from 'echarts' // 引入echarts

// 如果在这里使用const定义 不能给上面的变量或函数使用
const isLoginView = ref(true) // 登录页面 or 注册页面
const iserror = ref(false) // 控制失败浮窗
const content = ref('') // 事务
const queue = ref<{ id: number; text: string; check: number }[]>([])
// 对象范式 集成-事务id 事物content 是否打勾check
const isLoginStatus = ref(false) // 登录状态
const username = ref('') // 用户名
const password = ref('') // 密码

const userinfo = ref(false) // true显示userinfo

// const echartsdom = ref<null|HTMLElement>(null) // 限制两种类型赋值null
// 老方法失效
// 引入echarts
// const echarts = require("echarts");

// 初始化echarts实例
// const angle = echarts.init(document.getElementById("angle"))
// 由于angle的dom尚未挂载，angle返回null导致报错 由于userinfo是响应变量可以通过watch监听

// 图表实例（全局变量，避免重复创建）
// let chartInstance:number = 0 // 用于监听图标是否生成
// 1. 定义全局图表实例（外部声明，避免每次重新定义）
let chartInstance: echarts.ECharts | null = null

// userinfo的值初始化函数
watch(userinfo, async (val) => {
  if (val) {
    updatecharts()
  }
})

// 更新
watch(queue, () => {
  // 应该是数据更新时图表渲染，userinfo只是控制展示图表
  if (chartInstance && userinfo.value) {
    updatecharts()
  }
})

async function updatecharts() {
  await nextTick() // 等待dom渲染
  const angleDom = document.getElementById('angle')

  if (angleDom) {
    if (chartInstance) {
      // 问题代码：每次触发时直接创建新实例，未处理旧实例
      chartInstance.dispose()
    }
    // if(chartInstance == 1){
    //   angle.dispose()
    //   chartInstance = 0
    // }
    // 需要考虑两个值都为0，导致的一半一半
    chartInstance = echarts.init(angleDom) // 需要声明全局变量
    const completed = queue.value.filter((item) => item.check == 2).length
    const remaining = queue.value.filter((item) => item.check == 1).length

    if (completed == 0 && remaining == 0) {
      chartInstance.setOption({
        series: [
          {
            name: '计划完成表',
            type: 'pie', // 饼图
            radius: '50%', // 视图高宽较小的50%
            data: [{ value: remaining, name: '无数据' }],
            label: {
            // 统一设置标签样式，也可根据数据长度动态调整
            fontSize: 20, // 只有 1 项时放大标签
            show: true
            },
          },
        ],
      })
    }
    else if(remaining === 0 && completed > 0){
        chartInstance.setOption({
        series: [
          {
            name: '计划完成表',
            type: 'pie', // 饼图
            radius: '50%', // 视图高宽较小的50%
            data: [{ value: completed, name: '已完成' }],
            label: {
            // 统一设置标签样式，也可根据数据长度动态调整
            fontSize: 20, // 只有 1 项时放大标签
            show: true
            },
          },
        ],
      })
    }
    else if(completed === 0 && remaining > 0){
        chartInstance.setOption({
        series: [
          {
            name: '计划完成表',
            type: 'pie', // 饼图
            radius: '50%', // 视图高宽较小的50%
            data: [{ value: remaining, name: '未完成' }],
            label: {
            // 统一设置标签样式，也可根据数据长度动态调整
            fontSize: 20, // 只有 1 项时放大标签
            show: true
            },
          },
        ],
      })
    }
    else {
      console.log(queue.value)
      console.log(completed)
      console.log(remaining)
      // 利用echarts实例生成饼图
      chartInstance.setOption({
        series: [
          {
            name: '计划完成表',
            type: 'pie', // 饼图
            radius: '50%', // 视图高宽较小的50%
            data: [
              { value: completed, name: '未完成' },
              { value: remaining, name: '已完成' },
            ],
            label: {
            // 统一设置标签样式，也可根据数据长度动态调整
            fontSize: 16, // 只有 1 项时放大标签
            show: true
            },
          },
        ],
      })
    }
    // chartInstance = 1;
  }
  // const completed = Object.values(queue.value).filter(check => check.check == 2) // 完成
  // const remaining = Object.values(queue.value).filter(check => check.check == 1) // 未完成
}

// // 如果在这里使用const定义 不能给上面的变量或函数使用
// const isLoginView = ref(true) // 登录页面 or 注册页面
// const iserror = ref(false) // 控制失败浮窗
// const content = ref('') // 事务
// const queue = ref<{ id: number; text: string; check: number }[]>([])
// // 对象范式 集成-事务id 事物content 是否打勾check
// const isLoginStatus = ref(false) // 登录状态
// const username = ref('') // 用户名
// const password = ref('') // 密码

const request = axios.create({
  // baseURL: '/api', // url基础路径
  timeout: 2500, // 请求超时时间
})

request.interceptors.request.use(
  // 请求拦截器
  (config) => {
    //
    // 从 localStorage 中获取令牌
    const token = localStorage.getItem('Bearer')
    if (token) {
      // 注意：JWT 通常要求格式为 "Bearer <令牌>"（Bearer + 空格 + 令牌）
      config.headers.Authorization = `Bearer ${token}`
    }
    return config // 按照config发送请求体
  },
  (error) => {
    return Promise.reject(error)
  },
)

function query() {
  request
    .post('http://127.0.0.1:5000/api/query', {
      token: localStorage.getItem('Bearer'),
    })
    .then((res) => {
      queue.value = res.data.map((item: any) => ({
        id: item.id,
        text: item.content,
        check: item.status,
      }))
    })
}

function handleLogin() {
  // 这里可以加实际登录逻辑，成功后：
  isLoginStatus.value = true
  // 为了防止在注册框中点击叉叉导致下一次原本进入登录框时，却进入了注册框
  isLoginView.value = true // 需要校验最后为true 登录框 因为进入注册框的按钮会调整isLoginView的值
}

function showError() {
  iserror.value = true
  clearTimeout((window as any).toastTimer)
  window.toastTimer = setTimeout(() => {
    iserror.value = false
  }, 2000)
}

// function queryUserInfo(){
//   axios.post(("http://127.0.0.1:5000/api/subAccount"),{
//     token: localStorage.getItem("Bearer")
//   }).then((res) =>{
//     if(res.data.status){
//       username:
//     }
//   })
// }


// function UserInfo(){
//   if(userinfo.value == true){ // 打开用户视图
//     queryUserInfo()
//   }
// }

function register() {
  if (isLoginView.value == true || !(username.value.trim() && password.value.trim())) {
    isLoginView.value = !isLoginView.value
  } else {
    request
      .post('http://127.0.0.1:5000/api/register', {
        username: username.value.trim(),
        password: password.value.trim(),
      })
      .then((res) => {
        if (res.data.status) {
          isLoginView.value = !isLoginView.value
          isLoginStatus.value = !isLoginStatus.value
          localStorage.setItem('Bearer', res.data.data.token)
          query()
        } else {
          alert('注册失败')
        }
      })
      .catch(() => {
        // 状态码返回4xx 5xx
        showError()
        alert('用户和密码已存在')
      })
  }
}

function Login() {
  // 这里其实应该还有验证密码和账号是不是有一个为空的情况
  request({
    url: 'http://127.0.0.1:5000/api/login',
    method: 'POST',
    data: {
      username: username.value.trim(),
      password: password.value.trim(),
    },
  })
    .then((res) => {
      if (res.data.status) {
        // console.log(res.data.data)
        localStorage.setItem('Bearer', res.data.data['token'])
        isLoginStatus.value = true
        query()
      } else {
        showError()
        // 这里会出现一个失败浮窗效果
      }
    })
    .catch((err) => {
      console.log('连接失败' + err.data)
      showError()
      // 服务器连接失败
    })
}

function tick(id: number, index: number) {
  request({
    url: 'http://127.0.0.1:5000/api/tick',
    method: 'POST',
    data: {
      id: id, // 传入的是info id
    },
  }).then((res) => {
    if (res.data.status) {
      // console.log(index)
      // const item = queue.value.find(query => query.id === index)
      // if (item) {
      //   item.check = !item.check
      // }
      // queue.value[index].check = res.data.data.data
      queue.value[index].check = res.data.data.data
      query()
    }
  })
}

function sub(id: number) {
  request
    .post('http://127.0.0.1:5000/api/subContent', {
      id: id,
      // 先做一个id查询---jwt: jwt
    })
    .then((res) => {
      if (res.data.status) {
        // queue.value.splice(id, 1) 这一段没必要因为删除后触发查询会将queue 覆盖
        query()
      } else {
        alert(res.data.msg || '删除失败')
        showError()
      }
    })
    .catch(() => {
      alert('删除失败，服务器无响应')
      showError()
    })
}

function add() {
  if (!content.value) {
    alert('请输入')
  } else {
    content.value = content.value.trim()
    request
      .post('http://127.0.0.1:5000/api/add', {
        content: content.value,
        token: localStorage.getItem('Bearer'),
      })
      .then((res) => {
        if (res.data.status) {
          // 成功2xx
          queue.value.push({ id: res.data.id, text: content.value, check: 0 })
          content.value = ''
          query()
        } else {
          alert(res.data.msg || '添加失败')
          showError()
        }
      })
      .catch((err) => {
        // 4 5xx
        showError()
        alert(err.data.msg) // 这里应该有中文输出
        // || "添加失败，服务器无响应"
      })
  }
}
</script>

<template>
  <Basiclayouts
    :isLoginStatus="isLoginStatus"
    @changeLoginStatus="
      isLoginStatus = !isLoginStatus;
      userinfo = false
    "
    @changeRigsterStatus="
      isLoginStatus = !isLoginStatus;
      isLoginView = !isLoginView;
      userinfo = false
    "
    @isUserInfo="userinfo = !userinfo"
  />
  <div id="container" v-if="!userinfo">
    <div :class="['todo-blur-wrap', { blur: !isLoginStatus }]">
      <div class="menu">
        <h1>Todo App</h1>
        <div class="icheck">
          <input
            type="text"
            v-model="content"
            @keyup.enter="add()"
            class="memory"
            placeholder="Add todo"
          />
          <button @click="add()" id="todo">Add todo</button>
        </div>
        <div
          v-for="(item, index) in queue"
          :key="item.id"
          :class="item.check == 2 ? 'tcheck1' : 'tcheck'"
        >
          <div>
            <input
              @change="tick(item.id, index)"
              :checked="item.check == 2"
              type="checkbox"
              name="todo"
            />
            <span>{{ item.text }}</span>
          </div>
          <div class="del" @click="sub(item.id)">del</div>
        </div>
      </div>
    </div>
    <div v-if="!isLoginStatus" class="Login">
      <h2>{{ isLoginView ? '登录' : '注册' }}</h2>
      <label>账号<input type="text" v-model="username" /></label>
      <label>密码<input type="password" v-model="password" /></label>
      <div>
        <!-- 目前有个新想法设计l&r对象使用下标来访问 第一个h2标签是Login还是Register -->
        <button v-if="isLoginView" @click="Login">登录</button>
        <!-- 点击登陆后 Login变成Register 登录按钮消失 -->
        <button @click="register" :style="{ width: isLoginView ? '90%' : '50%' }">注册</button>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        @click="handleLogin"
        id="login_bu"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-backspace"
        viewBox="0 0 16 16"
      >
        <path
          d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z"
        />
        <path
          d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z"
        />
      </svg>
    </div>
    <!-- 登录失败浮窗 -->
    <transition name="fade">
      <div v-if="iserror" class="error-toast">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#e53e3e" />
          <path d="M10 5v5" stroke="#fff" stroke-width="2" stroke-linecap="round" />
          <circle cx="10" cy="14" r="1" fill="#fff" />
        </svg>
        <span>{{ isLoginView ? '登录' : '注册' }}失败</span>
      </div>
    </transition>
  </div>

  <!-- 用户信息页面 -->
  <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
  <div id="user" v-if="userinfo">
    <div id="angle">
      <div style="width: 600px; height: 200px; position: relative"></div>
    </div>
    <!-- 齿印分隔线 -->
    <!-- <div class="tooth-divider"></div> -->

    <!-- 在#user内部添加分隔线
    <div class="tooth-divider"></div> -->
    <div id="uinfo">
      <div id="utitle">用户信息</div>
      <span>用户名:{{username}}</span><br />
      <span>密码:{{password}}</span>
    </div>
  </div>
</template>

<!-- 想要分离文件查找样式和交互逻辑(js)有些麻烦 -->

<style>
/* 齿印分隔线样式 */
.tooth-divider {
  /* 垂直方向的齿印（高度100%，宽度10px） */
  width: 10px;
  height: 100%;
  /* 使用线性渐变绘制齿印 */
  background-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 40%,
    transparent 40%,
    transparent 60%,
    #000 60%,
    #000 100%
  );
  /* 重复渐变形成连续齿印 */
  background-size: 10px 20px; /* 每个齿印单元：宽10px，高20px */
  background-repeat: repeat-y;
}

/* 水平方向的齿印（宽度100%，高度10px） */
.tooth-divider-horizontal {
  width: 100%;
  height: 10px;
  background-image: linear-gradient(
    to right,
    #000 0%,
    #000 40%,
    transparent 40%,
    transparent 60%,
    #000 60%,
    #000 100%
  );
  background-size: 20px 10px; /* 每个齿印单元：宽20px，高10px */
  background-repeat: repeat-x;
}

/* 示例：双栏布局中间的齿印分隔 */
.two-column-layout {
  display: flex;
  width: 800px;
  height: 500px;
  margin: 20px auto;
}

.left-panel,
.right-panel {
  flex: 1;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

/* 黑色背景上的白色齿印 */
.dark-theme .tooth-divider {
  background-image: linear-gradient(
    to bottom,
    #fff 0%,
    #fff 40%,
    transparent 40%,
    transparent 60%,
    #fff 60%,
    #fff 100%
  );
}

#utitle {
  font-size: 40px;
  z-index: 10;
  /* 为了定位父容器top等属性 父元素需要relative */
  position: absolute;
  top: 25px;
  left: 20px;
}

/* 垂直齿印分隔线 */
/* .tooth-divider {
  width: 10px;
  background-image: linear-gradient(
    to bottom,
    rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) 40%,
    transparent 40%, transparent 60%,
    rgba(255,255,255,0.3) 60%, rgba(255,255,255,0.3) 100%
  );
  background-size: 10px 20px;
  background-repeat: repeat-y;
} */

#angle {
  /* gap: 20px; */
  background-color: #f8f9fa; /* 浅灰替代纯白，减少刺眼感 */
  border-radius: 20px 0 0 20px;
  padding: 20px; /* 增加内边距，避免内容贴边 */
  display: flex;
  flex-direction: column; /* 内部文字和图表垂直排列 */
  align-items: center; /* 水平居中 */
}

#uinfo {
  position: relative;
  display: flex;
  /*
  容器内的元素非字体居中
  align-items: cneter;
  justify-items: center;
  */
  background: linear-gradient(-120deg, #333 0%, #111 100%); /* 深灰渐变，替代黑白，减少刺眼 */
  border-radius: 0 20px 20px 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white; /* 文字设为白色，适配深色背景 */
}

#uinfo {
  display: flex;
  flex-direction: column;
  background: linear-gradient(-120deg, white 0%, black 100%);
  width: 90vw;
  max-width: 800px;
  min-height: 500px;
  border-radius: 0 20px 20px 0px;
  justify-content: center;
  align-items: center;
  /* 逆时针 */
}

#user {
  margin: 20px auto;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  width: 90vw;
  max-width: 1200px;
  min-height: 500px;
  overflow: hidden; /*避免子元素圆角溢出 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 增加阴影，提升立体感 */
}

/* 设计思想是左右对齐，因此最好样式一致 */
#uinfo,
#angle {
  flex: 1; /*左右对齐 */
  min-height: 500px; /*保持高度*/
}

#angle span {
  font-size: 24px; /* 缩小标题字体，避免过大 */
  font-weight: 600;
  color: #333;
  margin-bottom: 20px; /* 与图表保持距离 */
}

#angle > div {
  /* 图表容器 */
  width: 100%; /* 占满父容器宽度 */
  height: calc(100% - 60px); /* 减去标题高度，避免溢出 */
  min-height: 350px;
  background-color: white; /* 图表区域用白色，突出内容 */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 轻微阴影，区分区域 */
}

#uinfo > span {
  /* 取消display:flex，改用块级元素垂直排列 */
  display: block;
  width: 80%; /* 适当缩小宽度，避免过宽 */
  padding: 16px 20px; /* 用padding替代height，更灵活 */
  margin: 12px 0; /* 增加上下间距，替代<br> */
  background-color: rgba(255, 255, 255, 0.1); /* 半透明白色，适配深色背景 */
  border-radius: 12px;
  font-size: 18px; /* 缩小字体，更精致 */
  text-align: center;
  transition: all 0.3s ease; /* 增加过渡动画 */
}

#uinfo > span:hover {
  background-color: rgba(255, 255, 255, 0.2); /*  hover时加深背景 */
  transform: translateY(-2px); /* 轻微上浮，增加交互感 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

body {
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Arial', sans-serif;
}
</style>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.error-toast {
  position: fixed;
  top: 40px;
  /* left: 50%; */
  /* transform: translateX(-50%); */
  background: #fff5f5;
  border-left: 4px solid #e53e3e;
  color: #e53e3e;
  padding: 14px 32px 14px 20px;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(229, 62, 62, 0.08);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2001;
  animation: fadeIn 0.5s;
}

#container {
  /* 核心：Flex 布局让子元素居中 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
/* 取消了scoped元素可能导致body一半生效一半失效 */

#login_bu {
  /* 相对于父容器top的举例 */
  top: 8px;
  /* top元素需要配合position!=static */
  right: 8px;
  position: absolute;
}

.todo-blur-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  transition: filter 0.3s;
}
.todo-blur-wrap.blur {
  /* 滤镜属性 */
  /* 实现浮窗 */
  filter: blur(10px) grayscale(0.2) brightness(0.8);
  pointer-events: none;
  user-select: none;
}

.Login {
  /* 绝对定位fixed相对于视口绝对 */
  position: fixed;
  /* absoulte相对于根元素绝对 */
  /* 移动-向左 */
  /* transform: translate(-50%, -50%); */
  width: 90vw;
  max-width: 400px;
  /* 容器高度根据元素自动设置 */
  height: auto;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  border: 1px solid #eee;
  box-shadow: 0 4px 24px rgba(161, 140, 209, 0.18);
  /* 设置优先级 */
  z-index: 1000;
  overflow: auto;
  display: flex;
  /* 容器内元素垂直展现 */
  flex-direction: column;
  /* 针对容器内元素 */
  justify-content: center;
  /* 元素水平和垂直居中 */
  align-items: center;
  padding: 32px 24px 24px 24px;
  animation: fadeIn 0.7s;
}
.Login h2 {
  /* 单独设置下边界隔开账号 */
  margin-bottom: 24px;
  color: #6d36dd;
  letter-spacing: 2px;
}
.Login label {
  display: block;
  margin-bottom: 16px;
  font-size: 16px;
  color: #555;
}
.Login input[type='text'],
.Login input[type='password'] {
  width: 220px;
  padding: 8px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  margin-left: 8px;
  font-size: 15px;
  transition:
    border 0.2s,
    box-shadow 0.2s;
  outline: none;
  box-shadow: 0 1px 2px rgba(161, 140, 209, 0.08);
}
.Login input[type='text']:focus,
.Login input[type='password']:focus {
  border: 1.5px solid #ba36dd;
  box-shadow: 0 0 0 2px #e9d6f7;
}
.Login div {
  /* margin-top: 12px; */
  /* background-color: red; */
  /* justify-content: space-between; */
  width: 200px;
  display: flex;
  justify-content: center;
  flex-direction: row;
  padding-left: 8px;
}
.Login button {
  margin-right: 5px;

  width: 90%;
  padding: 12px 0;
  background: linear-gradient(90deg, #ba36dd 0%, #6d36dd 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(161, 140, 209, 0.12);
  transition:
    background 0.2s,
    box-shadow 0.2s,
    transform 0.1s;
}
.Login button:hover {
  background: linear-gradient(90deg, #6d36dd 0%, #ba36dd 100%);
  box-shadow: 0 4px 16px rgba(161, 140, 209, 0.18);
  transform: translateY(-2px) scale(1.03);
}

.menu {
  width: 90vw;
  max-width: 800px;
  min-height: 500px;
  margin: 0 auto;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  overflow-y: auto;
  padding: 32px 0 32px 0;
  box-sizing: border-box;
  box-shadow: 0 4px 24px rgba(161, 140, 209, 0.12);
  animation: fadeIn 0.7s;
}
h1 {
  margin: 15px auto 30px auto;
  width: max-content;
  color: #6d36dd;
  letter-spacing: 2px;
  font-size: 2.2rem;
  font-weight: 700;
  text-shadow: 0 2px 8px #e9d6f7;
}
.icheck {
  margin: 0px auto 24px auto;
  width: max-content;
  display: flex;
  align-items: center;
  gap: 0;
}
.memory {
  padding-left: 16px;
  width: 40vw;
  max-width: 360px;
  height: 50px;
  border-radius: 20px 0 0 20px;
  font-size: 18px;
  border: 1.5px solid #e0e0e0;
  outline: none;
  box-shadow: 0 1px 2px rgba(161, 140, 209, 0.08);
  transition:
    border 0.2s,
    box-shadow 0.2s;
}
/* 动画样式最好放到上下比如元素transiton则下方会有动画样式如hover或者focus */
.memory:focus {
  /* 获得焦点 */
  /* 通常指在点击输入框 */
  border: 1.5px solid #ba36dd;
  box-shadow: 0 0 0 2px #e9d6f7;
}
#todo {
  width: 110px;
  height: 56px;
  border-radius: 0 20px 20px 0;
  font-size: 18px;
  background: linear-gradient(90deg, #ba36dd 0%, #6d36dd 100%);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(161, 140, 209, 0.12);
  transition:
    background 0.2s,
    box-shadow 0.2s,
    transform 0.1s;
}
#todo:hover {
  background: linear-gradient(90deg, #6d36dd 0%, #ba36dd 100%);
  box-shadow: 0 4px 16px rgba(161, 140, 209, 0.18);
  transform: translateY(-2px) scale(1.03);
}
.tcheck,
.tcheck1 {
  /* text-decoration: line-through; */
  background-color: #f8f8ff;
  display: flex;
  text-align: center;
  /* 子类元素平均分且元素互相远离 */
  justify-content: space-between;
  font-size: 18px;
  width: 90%;
  max-width: 550px;
  min-width: 300px;
  height: 33px;
  margin: 10px auto;
  /* 圆角 */
  border-radius: 15px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(161, 140, 209, 0.08);
  /* 容器内元素垂直分布 */
  align-items: center;
  transition:
    box-shadow 0.2s,
    background 0.2s;
  cursor: pointer;
}
.tcheck1 {
  text-decoration: line-through;
}

.tcheck:hover,
.tcheck1:hover {
  box-shadow: 0 4px 16px rgba(161, 140, 209, 0.18);
  background: #f3eaff;
}
.tcheck1 {
  /* 设置文本样式 -- 删除线 */
  text-decoration: line-through;
  color: #aaa;
  font-style: italic;
  opacity: 0.7;
}
.tcheck input[type='checkbox'] {
  margin-right: 10px;
  width: 20px;
  height: 20px;
  accent-color: #ba36dd;
  cursor: pointer;
  transition: accent-color 0.2s;
}
.del {
  color: #ba36dd;
  /* cursor属性设置鼠标接近时的光标样式 */
  cursor: pointer;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 8px;
  /* transiton配合hover 鼠标在元素上方逐步改变时间 */
  transition:
    background 0.2s,
    color 0.2s;
}
.del:hover {
  /* 鼠标在元素上方触发 */
  background: #e9d6f7;
  /* 增加阴影框 */
  color: #6d36dd;
}
/* 设置基于webkit内核浏览器的滚动条样式 */
::-webkit-scrollbar {
  /* 设置滚动条整体 */
  width: 8px;
  background: #f3eaff;
  border-radius: 8px;
}
::-webkit-scrollbar-thumb {
  /* 设置滚动条滑块样式 */
  background: #ba36dd;
  border-radius: 8px;
}
/* 页面小于900px时采用的样式设计,满足原生css的响应式设计 */
@media (max-width: 900px) {
  .menu,
  .Login {
    width: 98vw;
    max-width: 98vw;
    /* 移除默认min-width - auto */
    min-width: unset;
    padding: 12px 0;
  }
  .memory {
    width: 60vw;
    max-width: 98vw;
  }
  .tcheck,
  .tcheck1 {
    /* 想想对于viewpoint视口大小 */
    width: 98vw;
    max-width: 98vw;
    min-width: unset;
  }
  /* 根据根标签html字体(默认16px)相对大小 */
  h1 {
    font-size: 1.5rem;
  }
}
/* 定义动画,必须绑定元素和持续时间 */
/* 与animation搭配 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
