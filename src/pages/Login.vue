<template>
  <div class="login-page">
    <div class="login-header">
      <div class="login-logo">💎</div>
      <h1>建伟饰品</h1>
      <p style="color:#999;font-size:14px;margin-top:4px">精品饰品 · 用心甄选</p>
    </div>
    <div class="login-form">
      <div class="input-group">
        <label>手机号 / 用户名</label>
        <input v-model="username" type="text" placeholder="请输入手机号或用户名" />
      </div>
      <div class="input-group">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="请输入密码" @keyup.enter="doLogin" />
      </div>
      <button class="btn btn-primary btn-block btn-lg" @click="doLogin" style="margin-top:16px">登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const route = useRoute()
const showToast = inject('showToast')
const user = inject('user')
const username = ref('15506950010')
const password = ref('yjw18833388638')

async function doLogin() {
  if (!username.value || !password.value) {
    showToast('请输入用户名和密码')
    return
  }
  const res = await api.login(username.value, password.value)
  if (res.success) {
    user.value = res.user
    showToast('登录成功')
    const redirect = route.query.redirect || '/home'
    router.push(redirect)
  } else {
    showToast(res.error || '登录失败')
  }
}
</script>

<style scoped>
.login-page { padding: 60px 24px 0; min-height: 100vh; background: white; }
.login-header { text-align: center; margin-bottom: 40px; }
.login-logo { font-size: 64px; margin-bottom: 12px; }
.login-header h1 { font-size: 24px; font-weight: 700; }
.login-form { max-width: 360px; margin: 0 auto; }
</style>
