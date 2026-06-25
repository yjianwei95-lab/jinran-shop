<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">订单详情</span>
      <span></span>
    </div>

    <div v-if="!order" class="empty-state">
      <div class="icon">📋</div>
      <div class="text">订单不存在</div>
    </div>

    <template v-else>
      <!-- ═══ 订单状态头 ═══ -->
      <div class="order-status-header" :class="order.status">
        <div class="os-icon">{{ statusIcon }}</div>
        <div class="os-text">
          <div class="os-status">{{ statusText(order.status) }}</div>
          <div class="os-time">{{ order.created_at }}</div>
          <!-- ═══ 倒计时（仅待付款） ═══ -->
          <div v-if="order.status === 'pending'" class="os-countdown" :class="{ urgent: remainSec <= 30 }">
            ⏱ 剩余 {{ minStr }}:{{ secStr }} 自动取消
          </div>
          <div v-if="order.status === 'cancelled' && cancelReason" class="os-cancel-reason">
            {{ cancelReason }}
          </div>
        </div>
      </div>

      <!-- ═══ 付款/取消按钮（仅待付款） ═══ -->
      <div v-if="order.status === 'pending'" class="pay-section">
        <div class="pay-amount">需付款 <span class="pay-price">¥{{ Number(order.total_amount).toFixed(2) }}</span></div>
        <div class="pay-actions">
          <button class="pay-btn" @click="goPay">💳 立即付款</button>
          <button class="cancel-btn" @click="cancelOrder">✕ 取消订单</button>
        </div>
      </div>

      <!-- ═══ 删除订单（仅已取消） ═══ -->
      <div v-if="order.status === 'cancelled'" class="delete-section">
        <button class="delete-btn" @click="deleteOrder">🗑️ 删除此订单</button>
      </div>

      <!-- ═══ 收货信息 ═══ -->
      <div class="info-card">
        <div class="info-title">📍 收货信息</div>
        <div class="info-row">{{ addrName }} {{ addrPhone }}</div>
        <div class="info-row">{{ addrAddress }}</div>
        <div v-if="order.note" class="info-row">备注：{{ order.note }}</div>
      </div>

      <!-- ═══ 商品列表 ═══ -->
      <div class="info-card">
        <div class="info-title">📦 商品信息</div>
        <div v-for="(item, i) in order.items" :key="i" class="order-item">
          <div class="oi-emoji">{{ item.emoji || '📦' }}</div>
          <div class="oi-info">
            <div class="oi-name">{{ item.name }}</div>
            <div class="oi-spec" v-if="item.color || item.size">{{ item.color || '' }} {{ item.size || '' }}</div>
          </div>
          <div class="oi-right">
            <div class="oi-price">¥{{ Number(item.price).toFixed(2) }}</div>
            <div class="oi-qty">x{{ item.quantity }}</div>
          </div>
        </div>
      </div>

      <!-- ═══ 订单信息 ═══ -->
      <div class="info-card">
        <div class="info-title">📄 订单信息</div>
        <div class="info-line"><span>订单编号</span><span class="info-val">{{ order.id }}</span></div>
        <div class="info-line"><span>下单时间</span><span class="info-val">{{ order.created_at }}</span></div>
        <div class="info-line"><span>订单状态</span><span class="info-val" :style="{color: statusColor}">{{ statusText(order.status) }}</span></div>
        <div class="info-line info-divider"></div>
        <div class="info-line info-total"><span>合计</span><span class="info-total-price">¥{{ Number(order.total_amount).toFixed(2) }}</span></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTime = ref('')
const order = ref(null)
const remainSec = ref(0)
const cancelReason = ref('')

const PAYMENT_WINDOW = 3 * 60 // 3分钟

let timeInterval = null
let countdownTimer = null

function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  loadOrder()
})
onUnmounted(() => { clearInterval(timeInterval); clearInterval(countdownTimer) })

function loadOrder() {
  const id = route.params.id
  const saved = JSON.parse(localStorage.getItem('orders') || '[]')
  const found = saved.find(o => o.id === id)
  if (found) {
    order.value = found
    if (found.status === 'pending') startCountdown(found)
    return
  }
  // fallback
  order.value = {
    id: id || 'DEMO', items: [{ name: '简约珍珠锁骨链', price: 39.9, quantity: 1, emoji: '💎', color: '金色', size: '链长40cm' }],
    total_amount: 39.9, status: 'pending', created_at: new Date().toLocaleString('zh-CN'),
    created_at_ts: Date.now(), address: '张先生 155****0010 河南省济源市济源大道88号', note: '',
  }
  if (order.value.status === 'pending') startCountdown(order.value)
}

function startCountdown(o) {
  function tick() {
    const elapsed = Math.floor((Date.now() - (o.created_at_ts || Date.now())) / 1000)
    remainSec.value = Math.max(0, PAYMENT_WINDOW - elapsed)
    if (remainSec.value <= 0) {
      // 自动取消订单
      o.status = 'cancelled'
      cancelReason.value = '超时未支付，订单已自动取消'
      saveOrder(o)
      clearInterval(countdownTimer)
    }
  }
  tick()
  countdownTimer = setInterval(tick, 1000)
}

function saveOrder(o) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  const idx = orders.findIndex(x => x.id === o.id)
  if (idx >= 0) { orders[idx] = o; localStorage.setItem('orders', JSON.stringify(orders)) }
}

const minStr = computed(() => String(Math.floor(remainSec.value / 60)).padStart(2, '0'))
const secStr = computed(() => String(remainSec.value % 60).padStart(2, '0'))

const addrName = computed(() => order.value?.address?.split(' ')[0] || '')
const addrPhone = computed(() => order.value?.address?.split(' ')[1] || '')
const addrAddress = computed(() => order.value?.address?.split(' ').slice(2).join(' ') || order.value?.address || '')

const statusIcon = computed(() => {
  const map = { pending: '⏳', paid: '✅', shipped: '🚚', delivered: '📦', finished: '🎉', cancelled: '❌' }
  return map[order.value?.status] || '📋'
})

const statusColor = computed(() => {
  const map = { pending: '#ef4444', paid: '#c8a45c', shipped: '#1a2332', delivered: '#22c55e', finished: '#22c55e', cancelled: '#9a9aaa' }
  return map[order.value?.status] || '#4a4a5a'
})

function statusText(s) {
  const map = { pending: '待付款', paid: '已付款', shipped: '已发货', delivered: '已收货', finished: '已完成', cancelled: '已取消' }
  return map[s] || s
}

function goPay() {
  order.value.status = 'paid'
  saveOrder(order.value)
  clearInterval(countdownTimer)
  alert('💳 支付成功！')
}

function cancelOrder() {
  if (!confirm('确定取消此订单？')) return
  order.value.status = 'cancelled'
  cancelReason.value = '买家主动取消'
  saveOrder(order.value)
  clearInterval(countdownTimer)
}

function deleteOrder() {
  if (!confirm('确定删除此订单？删除后不可恢复')) return
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  const filtered = orders.filter(o => o.id !== order.value.id)
  localStorage.setItem('orders', JSON.stringify(filtered))
  // 回到订单列表
  const router = { back: () => window.history.back(), push: (p) => { window.location.hash = '#/orders' } }
  if (window.history.length > 1) window.history.back()
  else window.location.hash = '#/orders'
}
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }

/* ═══ 订单状态头 ═══ */
.order-status-header {
  display: flex; align-items: center; gap: 12px;
  padding: 24px 20px; margin: 0 16px 12px; border-radius: 12px;
}
.order-status-header.pending { background: #fef2f2; }
.order-status-header.paid { background: #fefce8; }
.order-status-header.shipped { background: #f0f4ff; }
.order-status-header.finished { background: #f0fdf4; }
.order-status-header.cancelled { background: #f5f5f5; }
.os-icon { font-size: 36px; }
.os-status { font-size: 18px; font-weight: 700; color: #1a2332; }
.os-time { font-size: 12px; color: #9a9aaa; margin-top: 2px; }
.os-countdown { font-size: 14px; color: #ef4444; font-weight: 700; margin-top: 6px; }
.os-countdown.urgent { animation: blink 0.5s infinite; }
.os-cancel-reason { font-size: 12px; color: #9a9aaa; margin-top: 4px; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

/* ═══ 付款区 ═══ */
.pay-section {
  margin: -4px 16px 12px; padding: 16px 20px;
  background: #fff; border-radius: 12px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.pay-amount { font-size: 15px; color: #4a4a5a; }
.pay-price { font-size: 22px; font-weight: 700; color: #c8a45c; }
.pay-btn {
  height: 44px; padding: 0 28px; border-radius: 22px;
  background: #1a2332; color: #fff; font-size: 15px; font-weight: 700;
  border: none; cursor: pointer; white-space: nowrap;
}
.pay-btn:active { opacity: 0.85; }
.pay-actions { display: flex; flex-direction: column; gap: 6px; }
.cancel-btn {
  height: 36px; padding: 0 20px; border-radius: 18px;
  background: #fff; color: #9a9aaa; font-size: 13px;
  border: 1px solid #e8e8e5; cursor: pointer;
}

/* ═══ 删除区 ═══ */
.delete-section { margin: -4px 16px 12px; text-align: center; }
.delete-btn {
  width: 100%; height: 48px; border-radius: 12px;
  background: #fff; color: #ef4444; font-size: 15px; font-weight: 600;
  border: 1px solid #fecaca; cursor: pointer;
}
.delete-btn:active { background: #fef2f2; }

/* ═══ 信息卡片 ═══ */
.info-card {
  background: #fff; margin: 0 16px 10px; border-radius: 12px; padding: 16px;
}
.info-title { font-size: 14px; font-weight: 700; color: #1a2332; margin-bottom: 10px; }
.info-row { font-size: 14px; color: #4a4a5a; line-height: 1.6; }
.info-line { display: flex; justify-content: space-between; font-size: 13px; color: #4a4a5a; padding: 4px 0; }
.info-val { color: #1a2332; text-align: right; max-width: 60%; word-break: break-all; }
.info-divider { border-top: 1px solid #e8e8e5; margin: 6px 0; }
.info-total { font-size: 15px; font-weight: 700; }
.info-total-price { font-size: 18px; font-weight: 700; color: #c8a45c; }

/* ═══ 商品列表 ═══ */
.order-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid #f5f4f0;
}
.order-item:last-child { border-bottom: none; }
.oi-emoji { width: 44px; height: 44px; border-radius: 8px; background: #f5f4f0; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.oi-info { flex: 1; min-width: 0; }
.oi-name { font-size: 14px; font-weight: 600; color: #1a2332; }
.oi-spec { font-size: 11px; color: #9a9aaa; margin-top: 2px; }
.oi-right { text-align: right; }
.oi-price { font-size: 15px; font-weight: 700; color: #1a2332; }
.oi-qty { font-size: 12px; color: #9a9aaa; }
</style>
