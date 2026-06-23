<template>
  <div class="page">
    <!-- 顶部 -->
    <div class="profile-header">
      <div class="avatar" @click="goProfile">{{ user?.nickname?.charAt(0) || '?' }}</div>
      <div class="profile-info">
        <div class="profile-name">{{ user?.nickname || '未登录' }}</div>
        <div class="profile-phone">{{ user?.phone || '' }}</div>
      </div>
      <div class="settings-icon" @click="$router.push('/settings')">⚙️</div>
    </div>

    <!-- 统计数据 -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-num">{{ orders.length }}</div>
        <div class="stat-label">全部订单</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">0</div>
        <div class="stat-label">待发货</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">0</div>
        <div class="stat-label">待收货</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">0</div>
        <div class="stat-label">待评价</div>
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-section">
      <div class="menu-item" @click="$router.push('/orders')">
        <span class="menu-icon">📋</span><span class="menu-label">我的订单</span><span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="$router.push('/address')">
        <span class="menu-icon">📍</span><span class="menu-label">收货地址</span><span class="menu-arrow">›</span>
      </div>
      <div class="menu-item">
        <span class="menu-icon">⭐</span><span class="menu-label">我的收藏</span><span class="menu-arrow">›</span>
      </div>
      <div class="menu-item">
        <span class="menu-icon">💬</span><span class="menu-label">联系客服</span><span class="menu-arrow">›</span>
      </div>
      <div class="menu-item">
        <span class="menu-icon">ℹ️</span><span class="menu-label">关于我们</span><span class="menu-arrow">›</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { api } from '../api.js'

const user = inject('user')
const orders = ref([])

onMounted(async () => {
  if (user.value) {
    const res = await api.getOrders()
    if (res.success) orders.value = res.orders || []
  }
})

function goProfile() {
  if (!user.value) return
}
</script>

<style scoped>
.profile-header {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  padding: 30px 20px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: white;
  position: relative;
}
.avatar {
  width: 60px; height: 60px; border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 700; cursor: pointer;
}
.profile-name { font-size: 18px; font-weight: 700; }
.profile-phone { font-size: 13px; opacity: 0.8; margin-top: 2px; }
.settings-icon { position: absolute; right: 16px; top: 16px; font-size: 22px; cursor: pointer; }
.stats-row {
  display: flex; background: white; margin: 0 16px; border-radius: 12px;
  padding: 16px 0; margin-top: -12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: relative; z-index: 10;
}
.stat-item { flex: 1; text-align: center; }
.stat-num { font-size: 20px; font-weight: 700; color: var(--primary); }
.stat-label { font-size: 12px; color: #999; margin-top: 2px; }
.menu-section { margin: 12px 16px; background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.menu-item:last-child { border: none; }
.menu-icon { font-size: 18px; margin-right: 12px; }
.menu-label { flex: 1; font-size: 15px; }
.menu-arrow { color: #ccc; font-size: 20px; }
</style>
