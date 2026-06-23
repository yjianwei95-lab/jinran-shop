<template>
  <div class="page">
    <div class="page-header" style="display:flex;align-items:center;gap:12px">
      <span style="cursor:pointer" @click="$router.back()">‹ 返回</span>
      <h1>结算</h1>
    </div>
    <div class="page-body">
      <div class="card" style="margin-bottom:12px">
        <div class="card-body" @click="selectAddress" style="cursor:pointer">
          <div v-if="selectedAddress">
            <div style="font-weight:600">{{ selectedAddress.name }} {{ selectedAddress.phone }}</div>
            <div style="font-size:13px;color:#666;margin-top:4px">{{ selectedAddress.region }} {{ selectedAddress.detail }}</div>
          </div>
          <div v-else style="color:#999">请选择收货地址 ›</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:12px">
        <div class="card-body">
          <div v-for="item in cartItems" :key="item.id" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f5f5f5">
            <div style="width:48px;height:48px;background:#f9f9f9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#ddd;font-size:20px;flex-shrink:0">{{ item.product_name?.charAt(0) || '?' }}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ item.product_name }}</div>
              <div style="font-size:13px;color:#999;margin-top:2px">x{{ item.quantity }}</div>
            </div>
            <div style="color:var(--primary);font-weight:700">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:12px">
        <div class="card-body">
          <div class="input-group">
            <label>备注</label>
            <textarea v-model="note" placeholder="选填，备注信息..."></textarea>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;background:white;border-radius:12px;padding:16px;margin-bottom:16px">
        <span style="font-size:15px">合计：</span>
        <span style="color:var(--primary);font-size:24px;font-weight:700">¥{{ total }}</span>
      </div>

      <button class="btn btn-primary btn-block btn-lg" @click="submitOrder">提交订单</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const showToast = inject('showToast')
const cartItems = ref([])
const addresses = ref([])
const selectedAddress = ref(null)
const note = ref('')

onMounted(async () => {
  const [cartRes, addrRes] = await Promise.all([api.getCart(), api.getAddresses()])
  if (cartRes.success) cartItems.value = cartRes.items || []
  if (addrRes.success) {
    addresses.value = addrRes.addresses || []
    selectedAddress.value = addresses.value.find(a => a.is_default) || addresses.value[0] || null
  }
})

const total = computed(() => cartItems.value.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2))

function selectAddress() {
  router.push('/address?select=true')
}

async function submitOrder() {
  if (!selectedAddress.value) {
    showToast('请选择收货地址')
    return
  }
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) { router.push('/login'); return }
  const res = await api.createOrder({
    customer_name: selectedAddress.value.name,
    customer_phone: selectedAddress.value.phone,
    customer_address: selectedAddress.value.region + ' ' + selectedAddress.value.detail,
    customer_note: note.value,
    items: cartItems.value.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
  })
  if (res.success) {
    showToast('下单成功')
    router.push('/orders')
  } else {
    showToast(res.error || '下单失败')
  }
}
</script>
