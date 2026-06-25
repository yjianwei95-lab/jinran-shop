<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">确认订单</span>
      <span></span>
    </div>

    <!-- ═══ 收货地址 ═══ -->
    <div class="checkout-section addr-section" @click="selectAddress">
      <div v-if="selectedAddress" class="addr-info">
        <div class="addr-top">
          <span class="addr-name">{{ selectedAddress.name }}</span>
          <span class="addr-phone">{{ selectedAddress.phone }}</span>
          <span v-if="selectedAddress.is_default" class="addr-default">默认</span>
        </div>
        <div class="addr-detail">{{ selectedAddress.region }} {{ selectedAddress.detail }}</div>
      </div>
      <div v-else class="addr-empty">
        <span>📍 请添加收货地址</span>
        <span class="addr-arrow">›</span>
      </div>
    </div>

    <!-- ═══ 商品列表 ═══ -->
    <div class="checkout-section">
      <div class="section-title-sm">商品信息</div>
      <div v-for="item in items" :key="item.id" class="checkout-item">
        <div class="co-img">{{ item.emoji || item.name.charAt(0) }}</div>
        <div class="co-info">
          <div class="co-name">{{ item.name }}</div>
          <div v-if="item.spec" class="co-spec">{{ item.spec }}</div>
        </div>
        <div class="co-right">
          <div class="co-price">¥{{ item.price.toFixed(2) }}</div>
          <div class="co-qty">x{{ item.quantity }}</div>
        </div>
      </div>
    </div>

    <!-- ═══ 备注 ═══ -->
    <div class="checkout-section">
      <div class="co-note-row">
        <span class="note-label">买家留言</span>
        <input v-model="note" class="note-input" placeholder="选填，备注颜色、款式等..." />
      </div>
    </div>

    <!-- ═══ 价格明细 ═══ -->
    <div class="checkout-section">
      <div class="co-price-detail">
        <div class="pd-row"><span>商品小计</span><span>¥{{ subtotal.toFixed(2) }}</span></div>
        <div class="pd-row"><span>运费</span><span style="color:#22c55e">免运费（全场包邮）</span></div>
        <div class="pd-divider"></div>
        <div class="pd-row pd-total"><span>合计</span><span>¥{{ finalTotal.toFixed(2) }}</span></div>
      </div>
    </div>

    <!-- ═══ 底部提交 ═══ -->
    <div class="checkout-bottom">
      <div class="cb-total">
        <span>合计: </span>
        <span class="cb-price">¥{{ finalTotal.toFixed(2) }}</span>
      </div>
      <button class="cb-btn" :disabled="submitting" @click="submitOrder">
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showToast = inject('showToast')
const currentTime = ref('')

const items = ref([])
const selectedAddress = ref(null)
const note = ref('')
const submitting = ref(false)

const subtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity * (i.checked !== false ? 1 : 0), 0))
const shipping = 0 // 全场包邮
const finalTotal = computed(() => subtotal.value)

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)

  // 优先读取"立即购买"的临时商品
  const checkoutNow = localStorage.getItem('checkout_now')
  if (checkoutNow) {
    try {
      items.value = JSON.parse(checkoutNow)
      localStorage.removeItem('checkout_now') // 读取后清除
    } catch { items.value = [] }
  }

  // 没有立即购买商品，则从购物车读取
  if (items.value.length === 0) {
    const saved = JSON.parse(localStorage.getItem('cart_items') || '[]')
    if (saved.length > 0) {
      items.value = saved.filter(i => i.checked !== false)
    }
  }

  // 仍然没有商品，给默认示例
  if (items.value.length === 0) {
    items.value = [
      { id: 1, name: '简约珍珠锁骨链', price: 39.90, emoji: '💎', spec: '金色', quantity: 1, checked: true },
      { id: 2, name: '珍珠耳钉套装', price: 29.90, emoji: '✨', spec: '白色', quantity: 1, checked: true },
    ]
  }

  // 加载地址
  const savedAddr = localStorage.getItem('selected_address')
  if (savedAddr) {
    try { selectedAddress.value = JSON.parse(savedAddr) } catch { }
  }
  if (!selectedAddress.value) {
    const defaultAddr = { id: 1, name: '张先生', phone: '155****0010', region: '河南省 济源市', detail: '济源大道 88 号建然百货', is_default: true }
    selectedAddress.value = defaultAddr
  }
})
onUnmounted(() => { clearInterval(timeInterval) })

function selectAddress() {
  router.push('/address?select=true')
}

async function submitOrder() {
  if (!selectedAddress.value) { showToast('请选择收货地址'); return }
  submitting.value = true

  // 尝试调后端，失败则本地模拟下单成功
  try {
    const res = await api.createOrder({
      customer_name: selectedAddress.value.name,
      customer_phone: selectedAddress.value.phone,
      customer_address: selectedAddress.value.region + ' ' + selectedAddress.value.detail,
      customer_note: note.value,
      items: items.value.map(i => ({ product_id: i.id, quantity: i.quantity })),
      total_amount: finalTotal.value,
    })
    if (res.success) {
      finishOrder()
    } else {
      showToast(res.error || '下单失败')
      submitting.value = false
    }
  } catch (e) {
    // 离线模式：清除购物车中已下单商品，跳转订单页
    finishOrder()
  }
}

function finishOrder() {
  // 保存订单到本地
  const order = {
    id: Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
    items: items.value.filter(i => i.checked !== false).map(i => ({ product_id: i.id, name: i.name, price: i.price, quantity: i.quantity, emoji: i.emoji, color: i.color, size: i.size })),
    total_amount: finalTotal.value,
    status: 'pending',
    created_at: new Date().toLocaleString('zh-CN'),
    created_at_ts: Date.now(), // 用于支付倒计时
    address: selectedAddress.value ? `${selectedAddress.value.name} ${selectedAddress.value.phone} ${selectedAddress.value.region} ${selectedAddress.value.detail}` : '',
    note: note.value,
  }
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  orders.unshift(order)
  localStorage.setItem('orders', JSON.stringify(orders))

  // 清除已结算的购物车商品
  const cart = JSON.parse(localStorage.getItem('cart_items') || '[]')
  const remaining = cart.filter(i => i.checked === false)
  localStorage.setItem('cart_items', JSON.stringify(remaining))
  localStorage.removeItem('selected_address')

  showToast('下单成功 🎉')
  submitting.value = false
  router.push('/orders')
}
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }

/* ═══ 通用区块 ═══ */
.checkout-section {
  background: #fff; margin: 10px 16px; border-radius: 12px; padding: 16px;
}

/* ═══ 地址 ═══ */
.addr-section { cursor: pointer; }
.addr-info { }
.addr-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.addr-name { font-size: 15px; font-weight: 600; color: #1a2332; }
.addr-phone { font-size: 14px; color: #4a4a5a; }
.addr-default { font-size: 10px; background: #c8a45c; color: #fff; padding: 1px 8px; border-radius: 8px; }
.addr-detail { font-size: 13px; color: #666; }
.addr-empty { display: flex; justify-content: space-between; align-items: center; color: #9a9aaa; font-size: 14px; }
.addr-arrow { font-size: 18px; color: #c0c0cc; }

/* ═══ 商品列表 ═══ */
.section-title-sm { font-size: 14px; font-weight: 600; color: #1a2332; margin-bottom: 10px; }
.checkout-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f5f4f0;
}
.checkout-item:last-child { border-bottom: none; }
.co-img {
  width: 48px; height: 48px; border-radius: 8px; background: #f5f4f0;
  display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
}
.co-info { flex: 1; min-width: 0; }
.co-name { font-size: 14px; font-weight: 600; color: #1a2332; }
.co-spec { font-size: 11px; color: #9a9aaa; margin-top: 2px; }
.co-right { text-align: right; }
.co-price { font-size: 15px; font-weight: 700; color: #1a2332; }
.co-qty { font-size: 12px; color: #9a9aaa; }

/* ═══ 备注 ═══ */
.co-note-row { display: flex; align-items: center; gap: 10px; }
.note-label { font-size: 14px; color: #4a4a5a; white-space: nowrap; }
.note-input { flex: 1; border: none; outline: none; font-size: 14px; color: #1a2332; }
.note-input::placeholder { color: #b0b0be; }

/* ═══ 价格明细 ═══ */
.pd-row { display: flex; justify-content: space-between; font-size: 13px; color: #4a4a5a; padding: 4px 0; }
.pd-divider { border-top: 1px solid #e8e8e5; margin: 6px 0; }
.pd-total { font-size: 16px; font-weight: 700; color: #1a2332; }

/* ═══ 底部提交 ═══ */
.checkout-bottom {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; background: #fff; border-top: 1px solid #e8e8e5;
}
.cb-total { display: flex; align-items: baseline; gap: 4px; flex: 1; justify-content: flex-end; font-size: 14px; color: #4a4a5a; }
.cb-price { font-size: 22px; font-weight: 700; color: #c8a45c; }
.cb-btn {
  height: 44px; padding: 0 28px; border-radius: 22px; background: #1a2332;
  color: #fff; font-size: 15px; font-weight: 600; border: none; cursor: pointer; white-space: nowrap;
}
.cb-btn:disabled { opacity: 0.6; }
</style>
