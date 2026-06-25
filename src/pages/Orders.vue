<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">我的订单</span>
      <span v-if="orders.length > 0" class="order-count">共 {{ orders.length }} 单</span>
    </div>

    <!-- ═══ 状态筛选 ═══ -->
    <div class="order-tabs">
      <span v-for="t in tabs" :key="t.key" class="order-tab"
        :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
        {{ t.label }}
      </span>
    </div>

    <div v-if="filteredOrders.length === 0" class="empty-state">
      <div class="icon">📋</div>
      <div class="text">{{ emptyText }}</div>
    </div>

    <div v-else class="order-list">
      <div v-for="o in filteredOrders" :key="o.id" class="order-card" @click="$router.push('/order/' + o.id)">
        <div class="order-header">
          <div class="order-left">
            <span class="order-id">订单 {{ o.id.slice(-8) }}</span>
            <span class="order-time">{{ o.created_at }}</span>
          </div>
          <span class="order-status" :class="o.status">{{ statusText(o.status) }}</span>
        </div>
        <div class="order-items">
          <span v-for="(item, i) in o.items?.slice(0, 3)" :key="i" class="order-item-emoji">{{ item.emoji || '📦' }}</span>
          <span v-if="(o.items?.length || 0) > 3" class="order-more">+{{ o.items.length - 3 }}</span>
        </div>
        <div class="order-footer">
          <span class="order-count-label">共 {{ o.items?.length || 0 }} 件商品</span>
          <span class="order-total">合计: <span class="order-price">¥{{ Number(o.total_amount).toFixed(2) }}</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const orders = ref([])
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '已付款' },
  { key: 'shipped', label: '已发货' },
  { key: 'finished', label: '已完成' },
]

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === activeTab.value)
})

const emptyText = computed(() => {
  const t = tabs.find(t => t.key === activeTab.value)
  return `暂无${t?.label || ''}订单`
})

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  loadOrders()
})
onUnmounted(() => { clearInterval(timeInterval) })

function loadOrders() {
  // 从 localStorage 加载本地订单
  const saved = JSON.parse(localStorage.getItem('orders') || '[]')
  if (saved.length > 0) {
    orders.value = saved
    return
  }
  // 无本地订单时，放几条示例
  orders.value = [
    { id: 'DEMO001', items: [{ name: '简约珍珠锁骨链', price: 39.9, quantity: 1, emoji: '💎' }], total_amount: 39.9, status: 'shipped', created_at: '2026-06-22 14:30', address: '张先生 155****0010 河南省济源市济源大道88号', note: '' },
    { id: 'DEMO002', items: [{ name: '珍珠耳钉套装', price: 29.9, quantity: 2, emoji: '✨' }], total_amount: 59.8, status: 'finished', created_at: '2026-06-20 09:15', address: '张先生 155****0010 河南省济源市济源大道88号', note: '' },
  ]
}

function statusText(s) {
  const map = { pending: '待付款', paid: '已付款', shipped: '已发货', delivered: '已收货', finished: '已完成', cancelled: '已取消' }
  return map[s] || s
}
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }
.order-count { font-size: 12px; color: #9a9aaa; }

/* ═══ 订单Tab ═══ */
.order-tabs {
  display: flex; background: #fff; padding: 0 16px;
  border-bottom: 1px solid #e8e8e5; overflow-x: auto;
}
.order-tab {
  padding: 12px 16px; font-size: 14px; color: #9a9aaa; cursor: pointer; white-space: nowrap;
  border-bottom: 2px solid transparent;
}
.order-tab.active { color: #1a2332; font-weight: 600; border-bottom-color: #c8a45c; }

/* ═══ 订单列表 ═══ */
.order-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.order-card {
  background: #fff; border-radius: 12px; padding: 14px 16px; cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.order-left { display: flex; flex-direction: column; gap: 2px; }
.order-id { font-size: 12px; color: #9a9aaa; }
.order-time { font-size: 11px; color: #b0b0be; }
.order-status { font-size: 13px; font-weight: 600; }
.order-status.pending { color: #ef4444; }
.order-status.paid { color: #c8a45c; }
.order-status.shipped { color: #1a2332; }
.order-status.finished { color: #22c55e; }

.order-items { display: flex; gap: 4px; margin-bottom: 8px; }
.order-item-emoji { font-size: 24px; }
.order-more { font-size: 12px; color: #9a9aaa; display: flex; align-items: center; }

.order-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f5f4f0; padding-top: 8px; }
.order-count-label { font-size: 12px; color: #9a9aaa; }
.order-total { font-size: 13px; color: #4a4a5a; }
.order-price { font-size: 16px; font-weight: 700; color: #1a2332; }
</style>
