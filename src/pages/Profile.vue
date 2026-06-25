<template>
  <div class="page" style="padding-bottom:0">
    <!-- ═══ 状态栏 ═══ -->
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>

    <!-- ═══ 个人头部 ═══ -->
    <div class="profile-header">
      <div class="profile-avatar-wrap" @click="pickAvatar">
        <img v-if="user?.avatar" :src="user.avatar" class="profile-avatar-img" />
        <div v-else class="profile-avatar">{{ user ? (user.nickname || user.username || '?').charAt(0) : '👤' }}</div>
        <div class="avatar-edit-badge">📷</div>
      </div>
      <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarSelected" />
      <div class="profile-name">{{ user ? user.nickname || user.username : '你好，建伟饰品' }}</div>
      <div class="profile-account" @click="goLogin">{{ user ? '查看个人资料' : '点击登录/注册' }}</div>
      <!-- ═══ 会员等级条 ═══ -->
      <div v-if="user" class="member-level-bar">
        <span class="member-level-tag">黄金会员</span>
        <div class="member-progress-wrap">
          <div class="member-progress" style="width:68%"></div>
        </div>
        <span class="member-next">距白金还差¥328</span>
      </div>
    </div>

    <!-- ═══ 资产概览 ═══ -->
    <div class="assets-section">
      <div class="asset-item" @click="goCoupon">
        <span class="asset-num">{{ couponCount }}</span>
        <span class="asset-label">优惠券</span>
      </div>
      <div class="asset-divider"></div>
      <div class="asset-item" @click="goPoints">
        <span class="asset-num">{{ pointsCount }}</span>
        <span class="asset-label">积分</span>
      </div>
      <div class="asset-divider"></div>
      <div class="asset-item" @click="$router.push('/favorite')">
        <span class="asset-num">{{ favCount }}</span>
        <span class="asset-label">收藏</span>
      </div>
      <div class="asset-divider"></div>
      <div class="asset-item" @click="goHistory">
        <span class="asset-num">{{ historyCount }}</span>
        <span class="asset-label">足迹</span>
      </div>
    </div>

    <!-- ═══ 我的订单 ═══ -->
    <div class="section-block">
      <div class="section-header">
        <span class="section-title">我的订单</span>
        <span class="section-more" @click="$router.push('/orders')">查看全部 →</span>
      </div>
      <div class="order-status-grid">
        <div v-for="s in orderStatuses" :key="s.key" class="order-status-item" @click="goOrders(s.key)">
          <div class="order-icon-wrap">
            <span class="order-icon">{{ s.icon }}</span>
            <span v-if="s.badge" class="order-badge">{{ s.badge }}</span>
          </div>
          <span class="order-label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- ═══ 常用功能菜单 ═══ -->
    <div class="section-block" style="padding:0">
      <div class="menu-group-title">常用功能</div>
      <div class="menu-grid">
        <div v-for="(item, i) in tools" :key="i" class="menu-grid-item" @click="menuClick(item.route)">
          <span class="menu-grid-icon">{{ item.icon }}</span>
          <span class="menu-grid-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- ═══ 服务列表 ═══ -->
    <div class="section-block" style="padding:0">
      <div v-for="(menu, i) in menus" :key="i" class="profile-menu-item" @click="menuClick(menu.route)">
        <span class="menu-icon">{{ menu.icon }}</span>
        <span class="menu-label">{{ menu.label }}</span>
        <span v-if="menu.value" class="menu-value">{{ menu.value }}</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <!-- ═══ 底部退出 ═══ -->
    <div v-if="user" class="profile-logout" @click="logout">退出登录</div>

    <!-- ═══ 底部版权 ═══ -->
    <div class="footer-bar">
      <div class="footer-text">建伟饰品 © 2026</div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const currentTime = ref('')
const router = useRouter()
const user = inject('user')
const showToast = inject('showToast')
const avatarInput = ref(null)

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  loadProfileData()
})
onUnmounted(() => { clearInterval(timeInterval) })

// 资产数据
const couponCount = ref(3)
const pointsCount = ref(1280)
const favCount = ref(6)
const historyCount = ref(12)

// 订单状态（带角标示例）
const orderStatuses = [
  { key: 'pending', icon: '📋', label: '待付款', badge: 2 },
  { key: 'deliver', icon: '📦', label: '待发货', badge: 0 },
  { key: 'receive', icon: '🚚', label: '待收货', badge: 1 },
  { key: 'review', icon: '✍️', label: '待评价', badge: 3 },
]

// 常用工具（图标式）
const tools = [
  { icon: '🎫', label: '优惠券', route: '/coupon' },
  { icon: '⭐', label: '积分商城', route: '/points' },
  { icon: '👣', label: '浏览记录', route: '/history' },
  { icon: '💬', label: '联系客服', route: '/feedback' },
]

// 更多服务（列表式）
const menus = [
  { icon: '❤️', label: '我的收藏', route: '/favorite' },
  { icon: '📍', label: '收货地址', route: '/address' },
  { icon: '🛡️', label: '退款/售后', route: '/orders?status=refund' },
  { icon: '📤', label: '分享给好友', route: '/share', value: '邀请得积分' },
  { icon: 'ℹ️', label: '关于我们', route: '/about' },
  { icon: '⚙️', label: '设置', route: '/settings' },
]

async function loadProfileData() {
  if (!user.value) return
  try {
    const res = await api.getUserInfo()
    if (res.success) {
      if (res.coupon_count !== undefined) couponCount.value = res.coupon_count
      if (res.points !== undefined) pointsCount.value = res.points
      if (res.fav_count !== undefined) favCount.value = res.fav_count
    }
  } catch (e) { /* offline fallback */ }
}

function goLogin() {
  if (!user.value) router.push('/login')
  else router.push('/profile-edit')
}

function pickAvatar() {
  if (!user.value) { showToast('请先登录'); return }
  avatarInput.value?.click()
}

function onAvatarSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { showToast('图片过大，请选择 5MB 以内的图片'); return }

  const reader = new FileReader()
  reader.onload = (ev) => {
    user.value = { ...user.value, avatar: ev.target?.result }
    showToast('头像已更新')
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}
function goOrders(status) {
  router.push('/orders?status=' + status)
}
function goCoupon() { router.push('/coupon') }
function goPoints() { router.push('/points') }
function goHistory() { router.push('/history') }

function menuClick(route) {
  if (route === '/share') {
    shareApp()
    return
  }
  if (!route) {
    showToast('功能开发中')
    return
  }
  router.push(route)
}

async function shareApp() {
  const shareData = {
    title: '建伟饰品',
    text: '精选好物，用心甄选！来建伟饰品发现属于你的精品饰品 🎁',
    url: 'https://jinran-shop-production.up.railway.app',
  }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      showToast('分享成功！')
    } catch (e) {
      if (e.name !== 'AbortError') showToast('分享取消')
    }
  } else {
    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(shareData.url)
      showToast('链接已复制，快去分享给好友吧！')
    } catch {
      showToast('分享功能暂不可用')
    }
  }
}

function logout() {
  user.value = null
  showToast('已退出登录')
  router.push('/home')
}
</script>

<style scoped>
/* ═══ 个人头部 ═══ */
.profile-header {
  background: linear-gradient(135deg, #1a2332 0%, #2c3a50 100%);
  padding: 32px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.profile-avatar {
  width: 64px; height: 64px;
  border-radius: 32px;
  background: #f5f4f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.profile-avatar-wrap { position: relative; cursor: pointer; }
.profile-avatar-img {
  width: 64px; height: 64px; border-radius: 32px;
  object-fit: cover;
}
.avatar-edit-badge {
  position: absolute; bottom: 0; right: -2px;
  width: 24px; height: 24px; border-radius: 12px;
  background: #c8a45c; display: flex; align-items: center;
  justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.profile-name { font-size: 18px; font-weight: 700; color: #fff; }
.profile-account { font-size: 13px; color: rgba(255,255,255,0.6); cursor: pointer; }

/* ═══ 会员等级条 ═══ */
.member-level-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  width: 100%;
  max-width: 300px;
}
.member-level-tag {
  font-size: 10px;
  color: #1a2332;
  background: #c8a45c;
  padding: 1px 8px;
  border-radius: 8px;
  font-weight: 600;
  white-space: nowrap;
}
.member-progress-wrap {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  overflow: hidden;
}
.member-progress {
  height: 100%;
  background: #c8a45c;
  border-radius: 2px;
}
.member-next {
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
}

/* ═══ 资产概览 ═══ */
.assets-section {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 0 20px;
  padding: 16px 0;
  border-radius: 0 0 12px 12px;
  margin-top: -4px;
}
.asset-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.asset-num {
  font-size: 22px;
  font-weight: 700;
  color: #1a2332;
}
.asset-label {
  font-size: 11px;
  color: #9a9aaa;
}
.asset-divider {
  width: 1px;
  height: 30px;
  background: #e8e8e5;
}

/* ═══ 订单状态 ═══ */
.order-status-grid {
  display: flex;
  gap: 0;
  padding-top: 8px;
}
.order-status-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.order-icon-wrap { position: relative; }
.order-icon { font-size: 24px; }
.order-badge {
  position: absolute;
  top: -4px;
  right: -10px;
  background: #ef4444;
  color: #fff;
  font-size: 9px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: 600;
}
.order-label { font-size: 11px; color: #4a4a5a; }

/* ═══ 常用功能（图标网格） ═══ */
.menu-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #9a9aaa;
  padding: 12px 16px 4px;
}
.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 8px 0 16px;
}
.menu-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 0;
}
.menu-grid-icon { font-size: 26px; }
.menu-grid-label { font-size: 11px; color: #4a4a5a; }

/* ═══ 列表菜单 ═══ */
.profile-menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #e8e8e5;
}
.profile-menu-item:last-child { border-bottom: none; }
.profile-menu-item:active { background: #f9f9f9; }
.menu-icon { font-size: 22px; margin-right: 10px; width: 28px; text-align: center; }
.menu-label { flex: 1; font-size: 15px; color: #1a2332; }
.menu-value { font-size: 12px; color: #c8a45c; margin-right: 8px; }
.menu-arrow { font-size: 20px; color: #c0c0cc; }

/* ═══ 退出 ═══ */
.profile-logout {
  text-align: center;
  padding: 20px;
  margin: 24px 20px 0;
  background: #fff;
  border-radius: 12px;
  color: #ef4444;
  font-size: 15px;
  cursor: pointer;
}
</style>
