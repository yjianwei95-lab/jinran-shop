<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>

    <div class="login-page">
      <div class="login-back" @click="$router.back()">← 返回</div>

      <div class="login-header">
        <div class="login-logo">💎</div>
        <h1 class="login-brand">建伟饰品</h1>
        <p class="login-slogan">精品饰品 · 用心甄选</p>
      </div>

      <div class="login-form">
        <div class="input-group">
          <label>手机号 / 用户名</label>
          <input v-model="username" type="text" placeholder="请输入手机号或用户名" autocomplete="username" />
        </div>
        <div class="input-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" @keyup.enter="doLogin" />
        </div>

        <button class="btn btn-primary btn-block btn-lg" :disabled="loading" @click="doLogin" style="margin-top:16px;height:50px;border-radius:25px">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <div class="login-extra">
          <span class="login-link" @click="showForgot">忘记密码？</span>
          <span class="login-link" @click="goRegister">立即注册</span>
        </div>
      </div>

      <!-- ═══ 测试账号提示 ═══ -->
      <div class="login-hint">
        <div class="hint-title">💡 测试账号</div>
        <div class="hint-row"><span>账号：</span><span class="hint-val" @click="fillAccount(1)">15506950010</span></div>
        <div class="hint-row"><span>密码：</span><span class="hint-val" @click="fillAccount(2)">yjw18833388638</span></div>
        <div class="hint-row" style="margin-top:6px;color:#c8a45c;font-size:12px" @click="fillAccount(3)">或点击自动填写</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const route = useRoute()
const showToast = inject('showToast')
const user = inject('user')

const currentTime = ref('')
const username = ref('')
const password = ref('')
const loading = ref(false)

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => { updateTime(); timeInterval = setInterval(updateTime, 60000) })
onUnmounted(() => { clearInterval(timeInterval) })

function fillAccount(type) {
  if (type === 1) { username.value = '15506950010'; return }
  if (type === 2) { password.value = 'yjw18833388638'; return }
  username.value = '15506950010'
  password.value = 'yjw18833388638'
}

async function doLogin() {
  if (!username.value.trim()) { showToast('请输入用户名'); return }
  if (!password.value.trim()) { showToast('请输入密码'); return }

  loading.value = true
  try {
    const res = await api.login(username.value.trim(), password.value.trim())
    if (res.success) {
      user.value = res.user
      showToast('登录成功')
      const redirect = route.query.redirect || '/home'
      setTimeout(() => router.push(redirect), 500)
    } else {
      showToast(res.error || '用户名或密码错误')
    }
  } catch (e) {
    // 后端不可用时使用本地模拟登录
    if (username.value === '15506950010' && password.value === 'yjw18833388638') {
      user.value = { id: 1, username: '15506950010', nickname: '建伟饰品VIP', phone: '15506950010' }
      showToast('登录成功')
      setTimeout(() => router.push('/home'), 500)
    } else {
      showToast('用户名或密码错误（请检查测试账号）')
    }
  } finally {
    loading.value = false
  }
}

function showForgot() { showToast('请联系客服重置密码: 400-888-6666') }
function goRegister() { showToast('注册功能即将开放') }
</script>

<style scoped>
.login-page {
  padding: 0 24px 40px;
  min-height: calc(100vh - 44px);
  background: #fff;
}
.login-back {
  padding: 12px 0;
  font-size: 16px;
  color: #1a2332;
  cursor: pointer;
}
.login-header {
  text-align: center;
  padding: 20px 0 32px;
}
.login-logo { font-size: 72px; margin-bottom: 8px; }
.login-brand { font-size: 26px; font-weight: 800; color: #1a2332; }
.login-slogan { font-size: 14px; color: #9a9aaa; margin-top: 6px; }
.login-form { max-width: 360px; margin: 0 auto; }

.login-extra {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.login-link { font-size: 14px; color: #9a9aaa; cursor: pointer; }

.login-hint {
  max-width: 360px;
  margin: 24px auto 0;
  background: #f9f8f5;
  border-radius: 10px;
  padding: 16px;
}
.hint-title { font-size: 13px; font-weight: 600; color: #4a4a5a; margin-bottom: 8px; }
.hint-row { font-size: 13px; color: #9a9aaa; padding: 3px 0; }
.hint-val { color: #c8a45c; cursor: pointer; font-weight: 600; }
</style>
