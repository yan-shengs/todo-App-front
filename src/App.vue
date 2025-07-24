<script setup lang="ts">
import { ref, onMounted,watch } from "vue"
import axios from 'axios'

const status = ref(false)
const todo = ref("")
const ab = ref<{id: number, text: string, check: number}[]>([])
const isLogin = ref(false) // 登录状态
const username = ref("")
const password = ref("")
const uid = ref("")

// 组件加载完毕后执行
// onMounted(() => {
//   if(uid.value != "" || isLogin.value != true){
//     query()
//   }
//   else{
//     watch(uid,()=>{
//       query();
//     })
//   }
// })

onMounted(() => {
  // 只有已登录时才处理（未登录不执行任何操作）
    if (uid.value !== '') {
      query();
    } else {
      // 已登录但uid为空，监听uid变化（只监听一次）
      watch(uid, (newVal) => {
        if (newVal !== '') { // 确保uid有值后再执行
          query();
        }
      });
   }
});


function query(){
  axios.post(("http://127.0.0.1:5000/api/query"),
  {
    userid: uid.value,
  }).then(res => {
        ab.value = res.data.map((item: any) => ({
            id: item.tipid,
            text: item.tiptodo,
            check: item.tipdone
        }))
    })
}

function add() {
    if (!todo.value) {
        alert("请输入");
    } else {
        todo.value = todo.value.trim();
        axios.post("http://127.0.0.1:5000/api/add", {
            todo: todo.value,
            userid:uid.value
        }).then(res => {
            if (res.data.success) { // 成功2xx
                ab.value.push({ id: res.data.id, text: todo.value, check: 0 });
                todo.value = "";
            } else {
                alert(res.data.msg || "添加失败");
            }
        }).catch((err) => { // 4 5xx
            alert(err.data.msg); // 这里应该有中文输出
            // || "添加失败，服务器无响应"
        });
    }
}

function sub(index: number,id: number) {
    const targetid = id;
    axios.post("http://127.0.0.1:5000/api/sub", {
        id: targetid
        // 先做一个id查询---jwt: jwt
    }).then(res => {
        if (res.data.success) {
            ab.value.splice(index, 1);
        } else {
            alert(res.data.msg || "删除失败");
        }
    }).catch(() => {
        alert("删除失败，服务器无响应");
    });
}

function tick(index: number,id: number) {
    axios({
        url: "http://127.0.0.1:5000/api/tick",
        method: "POST",
        data:{
            id:id
        }
    }).then((res) =>{
            if(res.data.success){
                console.log(res.data.data)
                ab.value[index].check = res.data.data;
            }
        })
}

function Login(){
  // 这里其实应该还有验证密码和账号是不是有一个为空的情况
  axios({
    url: "http://127.0.0.1:5000/api/login",
    method: "POST",
    // 注意是data:{}而不是data{}
    data:{
      // 别忘了去括号
      username:username.value.trim(),
      password:password.value.trim(),
    }
  }).then((res) => {
      if(res.data.success){
          // 逻辑上不能通过id查询或者通过id发送查询
          // 这里肯定不能返回明文或者jwt因为根据逻辑
          // 前端可以伪造发送id从而导致泄露
          // 我目前想到的是jwt发送后端解析jwt因为前端无法伪造jwt
          uid.value = res.data.id;
          isLogin.value = true;
          console.log(uid.value)
      }
      else{
          showError();
          // 这里会出现一个失败浮窗效果
      }
  }).catch((err) =>{
      console.log("连接失败")
      // 服务器连接失败
  })
}

// function sleep(time: number){ // 没有异步
//   let date = new Date().getTime() // 获取当前时间
//   let enddate = date + time
//   while(true){
//     if(new Date().getTime() >= enddate){
//       break
//     }
//   }
// }

function showError(){
  status.value = true
  clearTimeout((window as any).toastTimer);
  window.toastTimer = setTimeout(() => {
    status.value = false;
  }, 2000);
}

function handleLogin() {
    // 这里可以加实际登录逻辑，成功后：
    isLogin.value = true;
}
</script>

<template>
  <div id="body">
    <div :class="['todo-blur-wrap', { blur: !isLogin }]">
      <div class="menu">
        <h1>Todo App</h1>
        <div class="icheck">
          <input type="text" v-model="todo" @keyup.enter="add()" class="memory" placeholder="Add todo">
          <button @click="add()" id="todo">Add todo</button>
        </div>
        <div v-for="(item,index) in ab" :key="item.id" :class="(item.check==2)?'tcheck1':'tcheck'">
          <div>
            <input @change="tick(index,item.id)" :checked="item.check==2" type="checkbox" name="todo">
            <span>{{ item.text }}</span>
          </div>
          <div class="del" @click="sub(index,item.id)">
            del
          </div>
        </div>
      </div>
    </div>
    <div v-if="!isLogin" class="Login">
      <h2>Login</h2>
      <label>账号<input type="text" v-model="username" /></label><br>
      <label>密码<input type="password" v-model="password"/></label><br>
      <button @click="Login">登录</button>
      <svg xmlns="http://www.w3.org/2000/svg" @click="handleLogin" id="login_bu" width="16" height="16" fill="currentColor" class="bi bi-backspace" viewBox="0 0 16 16" >
        <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z"/>
        <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z"/>
      </svg>
    </div>
    <!-- 登录失败浮窗 -->
    <transition name="fade">
      <div v-if="status" class="error-toast">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#e53e3e"/><path d="M10 5v5" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="#fff"/></svg>
        <span>登录失败</span>
      </div>
    </transition>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
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
  box-shadow: 0 4px 16px rgba(229,62,62,0.08);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2001;
  animation: fadeIn 0.5s;
}

/* 有个一位style scoped意味着样式在此组件生效
因此导入到index中可能导致body失效因此再次设置body使其居中 */
#body{
  /* 核心：Flex 布局让子元素居中 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
}
/* 取消了scoped元素可能导致body一半生效一半失效 */

#login_bu{
  /* 相对于父容器top的举例 */
  top:8px;
  /* top元素需要配合position!=static */
  right:8px;
  position:absolute;
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

.todo-blur-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0; left: 0;
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
    background: rgba(255,255,255,0.98);
    border-radius: 20px;
    border: 1px solid #eee;
    box-shadow: 0 4px 24px rgba(161,140,209,0.18);
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
.Login input[type="text"], .Login input[type="password"] {
    width: 220px;
    padding: 8px 12px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    margin-left: 8px;
    font-size: 15px;
    transition: border 0.2s, box-shadow 0.2s;
    outline: none;
    box-shadow: 0 1px 2px rgba(161,140,209,0.08);
}
.Login input[type="text"]:focus, .Login input[type="password"]:focus {
    border: 1.5px solid #ba36dd;
    box-shadow: 0 0 0 2px #e9d6f7;
}
.Login button {
    margin-top: 12px;
    width: 100%;
    padding: 12px 0;
    background: linear-gradient(90deg, #ba36dd 0%, #6d36dd 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(161,140,209,0.12);
    transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}
.Login button:hover {
    background: linear-gradient(90deg, #6d36dd 0%, #ba36dd 100%);
    box-shadow: 0 4px 16px rgba(161,140,209,0.18);
    transform: translateY(-2px) scale(1.03);
}

.menu {
    width: 90vw;
    max-width: 800px;
    min-height: 500px;
    margin: 0 auto;
    border-radius: 20px;
    background: rgba(255,255,255,0.98);
    overflow-y: auto;
    padding: 32px 0 32px 0;
    box-sizing: border-box;
    box-shadow: 0 4px 24px rgba(161,140,209,0.12);
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
    box-shadow: 0 1px 2px rgba(161,140,209,0.08);
    transition: border 0.2s, box-shadow 0.2s;
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
    box-shadow: 0 2px 8px rgba(161,140,209,0.12);
    transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}
#todo:hover {
    background: linear-gradient(90deg, #6d36dd 0%, #ba36dd 100%);
    box-shadow: 0 4px 16px rgba(161,140,209,0.18);
    transform: translateY(-2px) scale(1.03);
}
.tcheck, .tcheck1 {
    /* text-decoration: line-through; */
    background-color: #F8F8FF;
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
    box-shadow: 0 2px 8px rgba(161,140,209,0.08);
    /* 容器内元素垂直分布 */
    align-items: center;
    transition: box-shadow 0.2s, background 0.2s;
    cursor: pointer;
}
.tcheck1{
  text-decoration: line-through;
}

.tcheck:hover, .tcheck1:hover {
    box-shadow: 0 4px 16px rgba(161,140,209,0.18);
    background: #f3eaff;
}
.tcheck1 {
    /* 设置文本样式 -- 删除线 */
    text-decoration: line-through;
    color: #aaa;
    font-style: italic;
    opacity: 0.7;
}
.tcheck input[type="checkbox"] {
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
    transition: background 0.2s, color 0.2s;
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
    .menu, .Login {
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
    .tcheck, .tcheck1 {
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
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
