<template>
  <div class="page">
    <div class="page-header" style="display:flex;align-items:center;gap:12px">
      <span style="cursor:pointer" @click="$router.back()">‹ 返回</span>
      <h1>订单详情</h1>
    </div>
    <div v-if="order" class="page-body">
      <div class="card" style="margin-bottom:12px">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span>订单号</span><span style="color:#666">{{ order.id }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span>状态</span><span style="color:var(--primary);font-weight:600">{{ statusText(order.status) }}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span>金额</span><span style="font-weight:700;font-size:18px;color:var(--primary)">¥{{ order.total_amount }}</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div style="font-weight:600;margin-bottom:8px">收货信息</div>
          <div style="font-size:14px;color:#666">{{ order.customer_name }} {{ order.customer_phone }}</div>
          <div style="font-size:14px;color:#666">{{ order.customer_address }}</div>
          <div v-if="order.customer_note" style="font-size:14px;color:#666;margin-top:4px">备注：{{ order.customer_note }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api.js'

const route = useRoute()
const order = ref(null)

onMounted(async () => {
  const res = await api.getOrder(route.params.id)
  if (res.success) order.value = res.order
})

function statusText(s) {
  const map = { pending: '待付款', paid: '已付款', shipped: '已发货', delivered: '已收货', cancelled: '已取消' }
  return map[s] || s
}
</script>
