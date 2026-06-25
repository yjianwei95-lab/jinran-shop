<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">积分商城</span>
      <span class="nav-link" @click="goHistory">积分记录</span>
    </div>

    <!-- ═══ 积分总览 ═══ -->
    <div class="points-header">
      <div class="points-balance">
        <span class="points-num">{{ points }}</span>
        <span class="points-unit">积分</span>
      </div>
      <div class="points-today">今日签到 +5分</div>
      <button class="btn-signin" @click="signIn">📅 签到领积分</button>
    </div>

    <!-- ═══ 可兑换商品 ═══ -->
    <div class="section-block">
      <div class="section-header">
        <span class="section-title">积分兑换</span>
      </div>
      <div class="exchange-grid">
        <div v-for="item in redeemable" :key="item.id" class="exchange-item" @click="redeem(item)">
          <div class="exchange-img">{{ item.emoji }}</div>
          <div class="exchange-name">{{ item.name }}</div>
          <div class="exchange-points">{{ item.points }}分</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showToast = inject('showToast')
const currentTime = ref('')
const points = ref(1280)
const signedIn = ref(false)

const redeemable = ref([
  { id: 1, name: '10元优惠券', points: 500, emoji: '🎫' },
  { id: 2, name: '20元优惠券', points: 900, emoji: '🎫' },
  { id: 3, name: '50元优惠券', points: 2000, emoji: '🎟️' },
  { id: 4, name: '定制礼品袋', points: 300, emoji: '🛍️' },
  { id: 5, name: '精美包装盒', points: 150, emoji: '🎁' },
  { id: 6, name: '免邮券', points: 100, emoji: '📦' },
])

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => { updateTime(); timeInterval = setInterval(updateTime, 60000) })
onUnmounted(() => { clearInterval(timeInterval) })

function signIn() {
  if (signedIn.value) { showToast('今日已签到'); return }
  signedIn.value = true
  points.value += 5
  showToast('签到成功 +5积分')
}

function redeem(item) {
  if (points.value < item.points) { showToast('积分不足'); return }
  points.value -= item.points
  showToast('兑换成功！可在优惠券中查看')
}

function goHistory() {
  showToast('暂无积分记录')
}
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }
.nav-link { font-size: 14px; color: #c8a45c; cursor: pointer; }

.points-header {
  background: linear-gradient(135deg, #1a2332, #2c3a50);
  padding: 30px 20px; display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.points-balance { display: flex; align-items: baseline; gap: 4px; }
.points-num { font-size: 48px; font-weight: 800; color: #c8a45c; }
.points-unit { font-size: 16px; color: rgba(255,255,255,0.6); }
.points-today { font-size: 13px; color: rgba(255,255,255,0.5); }
.btn-signin {
  height: 36px; padding: 0 24px; border-radius: 18px;
  background: #c8a45c; color: #1a2332; font-size: 14px; font-weight: 600;
  border: none; cursor: pointer; margin-top: 4px;
}

.exchange-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-top: 8px;
}
.exchange-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 8px; background: #f9f8f5; border-radius: 10px; cursor: pointer;
}
.exchange-img { font-size: 32px; }
.exchange-name { font-size: 12px; color: #4a4a5a; text-align: center; }
.exchange-points { font-size: 14px; font-weight: 700; color: #c8a45c; }
</style>
