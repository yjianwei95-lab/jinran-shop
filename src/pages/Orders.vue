<template>
  <div class="page">
    <div class="page-header" style="display:flex;align-items:center;gap:12px">
      <span style="cursor:pointer" @click="$router.back()">‹ 返回</span>
      <h1>我的订单</h1>
    </div>
    <div v-if="orders.length === 0" class="empty-state">
      <div class="icon">📋</div>
      <div class="text">暂无订单</div>
    </div>
    <div v-else class="order-list">
      <div v-for="o in orders" :key="o.id" class="order-card" @click="$router.push('/order/' + o.id)">
        <div class="order-header">
          <span class="order-id">订单 #{{ o.id }}</span>
          <span class="order-status">{{ statusText(o.status) }}</span>
        </div>
        <div class="order-body">
          <div class="order-total">¥{{ o.total_amount }}</div>
          <div class="order-time">{{ o.created_at }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api.js'

const orders = ref([])

onMounted(async () => {
  const res = await api.getOrders()
  if (res.success) orders.value = res.orders || []
})

function statusText(s) {
  const map = { pending: '待付款', paid: '已付款', shipped: '已发货', delivered: '已收货', cancelled: '已取消' }
  return map[s] || s
}
</script>

<style scoped>
.order-list { padding: 12px 16px; }
.order-card { background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); cursor: pointer; }
.order-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.order-id { font-size: 13px; color: #999; }
.order-status { font-size: 13px; color: var(--primary); font-weight: 600; }
.order-total { font-size: 18px; font-weight: 700; color: var(--primary); }
.order-time { font-size: 12px; color: #bbb; margin-top: 4px; }
</style>
