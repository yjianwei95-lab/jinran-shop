<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>

    <div class="cart-header">
      <h1 class="cart-title">购物车</h1>
      <span class="cart-edit" @click="editing = !editing">{{ editing ? '完成' : '编辑' }}</span>
    </div>

    <!-- ═══ 包邮进度条 ═══ -->
    <div v-if="items.length > 0" class="free-shipping-bar">
      <span class="fs-icon">🚚</span>
      <span v-if="freeShippingProgress < 100">
        还差 <strong>¥{{ (99 - subtotal).toFixed(0) }}</strong> 享包邮
      </span>
      <span v-else class="fs-achieved">✓ 已满足包邮条件</span>
      <div class="fs-progress-wrap">
        <div class="fs-progress" :style="{ width: Math.min(freeShippingProgress, 100) + '%' }"></div>
      </div>
    </div>

    <!-- ═══ 购物车列表（带滑动删除提示） ═══ -->
    <div v-if="items.length > 0" class="cart-list">
      <div v-for="(item, idx) in items" :key="item.id" class="cart-item-wrap">
        <div class="cart-item" @click="!editing && (item.checked = !item.checked)">
          <div class="cart-check" :class="{ checked: item.checked }" @click.stop="item.checked = !item.checked">
            <span v-if="item.checked" class="check-icon">✓</span>
          </div>
          <div class="cart-img">{{ item.emoji }}</div>
          <div class="cart-info">
            <div class="cart-name">{{ item.name }}</div>
            <div v-if="item.spec" class="cart-spec">{{ item.spec }}</div>
            <div class="cart-row">
              <span class="cart-price">¥{{ item.price.toFixed(2) }}</span>
              <div class="qty-selector" @click.stop>
                <button @click="decrease(item)">−</button>
                <input class="qty-input" :value="item.quantity" @focus="editQtyIdx = idx" @blur="commitQty(item, $event)" @keyup.enter="commitQty(item, $event)" />
                <button @click="increase(item)">+</button>
              </div>
            </div>
          </div>
          <!-- 删除按钮（编辑模式） -->
          <span v-if="editing" class="cart-del-btn" @click.stop="removeItem(idx)">🗑️</span>
        </div>
      </div>
    </div>

    <!-- ═══ 空购物车 ═══ -->
    <div v-else class="empty-state">
      <div class="icon">🛒</div>
      <div class="text">购物车是空的</div>
      <button class="btn btn-primary" style="margin-top:20px" @click="$router.push('/home')">去逛逛</button>
    </div>

    <!-- ═══ 价格明细 ═══ -->
    <div v-if="items.length > 0" class="price-breakdown">
      <div class="pb-row"><span>商品小计</span><span>¥{{ subtotal.toFixed(2) }}</span></div>
      <div class="pb-row"><span>运费</span><span>{{ subtotal >= 99 ? '免运费' : '¥10.00' }}</span></div>
      <div class="pb-row pb-divider"></div>
      <div class="pb-row pb-total"><span>合计</span><span>¥{{ (subtotal + (subtotal >= 99 ? 0 : 10)).toFixed(2) }}</span></div>
    </div>

    <!-- ═══ 可用优惠券 ═══ -->
    <div v-if="items.length > 0" class="cart-coupon-hint" @click="$router.push('/coupon')">
      <span>🎫 你有 <strong>{{ couponCount }}</strong> 张可用优惠券</span>
      <span>去使用 ›</span>
    </div>

    <!-- ═══ 猜你喜欢 ═══ -->
    <div v-if="items.length > 0" class="section-block">
      <div class="section-header">
        <span class="section-title">🔥 猜你喜欢</span>
      </div>
      <div class="recommend-scroll">
        <div v-for="r in recommends" :key="r.id" class="rec-card" @click="$router.push('/product/' + r.id)">
          <div class="rec-img">{{ r.emoji }}</div>
          <div class="rec-name">{{ r.name }}</div>
          <div class="rec-price-row">
            <span class="rec-price">¥{{ r.price }}</span>
            <span class="rec-add" @click.stop="addRecommend(r)">＋</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 底部结算栏 ═══ -->
    <div v-if="items.length > 0" class="cart-bottom">
      <div class="cart-bottom-left" @click="toggleAll">
        <div class="cart-check" :class="{ checked: allChecked }">
          <span v-if="allChecked" class="check-icon">✓</span>
        </div>
        <span>全选</span>
      </div>
      <div class="cart-total">
        <span class="cart-total-label">合计</span>
        <span class="cart-total-price">¥{{ (subtotal + (subtotal >= 99 ? 0 : 10)).toFixed(2) }}</span>
      </div>
      <button class="cart-checkout" @click="checkout">结算({{ checkedCount }})</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showToast = inject('showToast')
const currentTime = ref('')

const editing = ref(false)
const editQtyIdx = ref(-1)
const couponCount = ref(3)

// 从 localStorage 加载购物车
function loadCart() {
  const saved = localStorage.getItem('cart_items')
  if (saved) {
    try { items.value = JSON.parse(saved).map(i => ({ ...i, checked: i.checked !== false })) }
    catch { items.value = defaultItems() }
  } else {
    items.value = defaultItems()
  }
}

function defaultItems() {
  return [
    { id: 1, name: '简约珍珠锁骨链', spec: '颜色: 白珍珠', price: 39.90, quantity: 1, checked: true, emoji: '💎' },
    { id: 2, name: '珍珠耳钉套装', spec: '颜色: 白色', price: 29.90, quantity: 1, checked: true, emoji: '✨' },
  ]
}

function saveCart() {
  localStorage.setItem('cart_items', JSON.stringify(items.value))
}

const items = ref([])

const allChecked = computed(() => items.value.length > 0 && items.value.every(i => i.checked))
const checkedCount = computed(() => items.value.filter(i => i.checked).length)
const subtotal = computed(() => items.value.filter(i => i.checked).reduce((s, i) => s + i.price * i.quantity, 0))
const freeShippingProgress = computed(() => Math.min((subtotal.value / 99) * 100, 100))

const recommends = ref([
  { id: 5, name: '玛瑙手串', price: 68, emoji: '📿' },
  { id: 7, name: '纯银手镯', price: 139, emoji: '⭐' },
  { id: 8, name: '流苏耳环', price: 45, emoji: '💫' },
  { id: 3, name: '水晶发夹套装', price: 35, emoji: '🎀' },
])

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  loadCart()
})
onUnmounted(() => { clearInterval(timeInterval) })

function toggleAll() {
  const newVal = !allChecked.value
  items.value.forEach(i => { i.checked = newVal })
  saveCart()
}

function increase(item) { item.quantity++; saveCart() }
function decrease(item) {
  if (item.quantity > 1) { item.quantity--; saveCart() }
}

function commitQty(item, e) {
  const val = parseInt(e.target.value)
  if (!isNaN(val) && val > 0 && val < 1000) item.quantity = val
  else item.quantity = 1
  editQtyIdx.value = -1
  saveCart()
}

function removeItem(idx) {
  items.value.splice(idx, 1)
  saveCart()
}

function addRecommend(r) {
  const exist = items.value.find(i => i.id === r.id)
  if (exist) { exist.quantity++; showToast('已增加数量') }
  else { items.value.push({ ...r, quantity: 1, checked: true, spec: '' }); showToast('已加入购物车') }
  saveCart()
}

function checkout() {
  if (checkedCount.value === 0) { showToast('请选择商品'); return }
  router.push('/checkout')
}
</script>

<style scoped>
.cart-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; background: #fff;
}
.cart-title { font-size: 20px; font-weight: 700; color: #1a2332; }
.cart-edit { font-size: 15px; color: #9a9aaa; cursor: pointer; }

/* ═══ 包邮进度条 ═══ */
.free-shipping-bar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  margin: 0 16px 12px; padding: 10px 14px;
  background: #f9f8f5; border-radius: 10px; font-size: 12px; color: #4a4a5a;
}
.fs-icon { font-size: 18px; }
.fs-achieved { color: #22c55e; font-weight: 600; }
.fs-progress-wrap { width: 100%; height: 4px; background: #e8e8e5; border-radius: 2px; overflow: hidden; }
.fs-progress { height: 100%; background: linear-gradient(to right, #c8a45c, #22c55e); border-radius: 2px; transition: width 0.3s; }

/* ═══ 商品列表 ═══ */
.cart-list { padding: 0 16px 12px; display: flex; flex-direction: column; gap: 10px; }
.cart-item {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border-radius: 10px; padding: 10px; cursor: pointer;
}
.cart-check {
  width: 20px; height: 20px; border-radius: 10px;
  border: 2px solid #c8a45c; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cart-check.checked { background: #c8a45c; }
.check-icon { color: #fff; font-size: 11px; font-weight: 700; }
.cart-img {
  width: 72px; height: 72px; border-radius: 8px; background: #f5f4f0;
  display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0;
}
.cart-info { flex: 1; min-width: 0; }
.cart-name { font-size: 14px; font-weight: 600; color: #1a2332; }
.cart-spec { font-size: 11px; color: #9a9aaa; margin-top: 2px; }
.cart-row { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
.cart-price { font-size: 16px; font-weight: 700; color: #1a2332; }
.cart-del-btn { font-size: 18px; cursor: pointer; }

/* ═══ 数量选择器 ═══ */
.qty-selector {
  display: inline-flex; align-items: center; border: 1px solid #e8e8e5; border-radius: 4px; overflow: hidden;
}
.qty-selector button {
  width: 26px; height: 26px; border: none; background: #f9f9f9;
  font-size: 14px; cursor: pointer; color: #4a4a5a;
}
.qty-input {
  width: 32px; height: 26px; text-align: center; border: none; border-left: 1px solid #e8e8e5;
  border-right: 1px solid #e8e8e5; font-size: 13px; font-weight: 600; color: #1a2332; outline: none;
}

/* ═══ 价格明细 ═══ */
.price-breakdown {
  margin: 0 16px 12px; padding: 12px 14px; background: #fff; border-radius: 10px;
}
.pb-row { display: flex; justify-content: space-between; font-size: 13px; color: #4a4a5a; padding: 3px 0; }
.pb-divider { border-top: 1px solid #e8e8e5; margin: 4px 0; }
.pb-total { font-size: 15px; font-weight: 700; color: #1a2332; }

/* ═══ 优惠券提示 ═══ */
.cart-coupon-hint {
  display: flex; justify-content: space-between; align-items: center;
  margin: 0 16px 12px; padding: 10px 14px; background: #fff8e8; border-radius: 10px;
  font-size: 13px; color: #4a4a5a; cursor: pointer; border: 1px dashed #c8a45c;
}

/* ═══ 猜你喜欢 ═══ */
.recommend-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
.recommend-scroll::-webkit-scrollbar { height: 2px; }
.rec-card {
  min-width: 120px; background: #f9f8f5; border-radius: 8px; padding: 10px; flex-shrink: 0; cursor: pointer;
}
.rec-img { font-size: 28px; text-align: center; margin-bottom: 6px; }
.rec-name { font-size: 12px; color: #1a2332; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rec-price-row { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.rec-price { font-size: 14px; font-weight: 700; color: #1a2332; }
.rec-add { width: 20px; height: 20px; border-radius: 10px; background: #1a2332; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; }

/* ═══ 底部结算栏 ═══ */
.cart-bottom {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; background: #fff; border-top: 1px solid #e8e8e5;
}
.cart-bottom-left { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; color: #1a2332; }
.cart-total { display: flex; align-items: baseline; gap: 4px; margin-left: auto; }
.cart-total-label { font-size: 13px; color: #4a4a5a; }
.cart-total-price { font-size: 20px; font-weight: 700; color: #c8a45c; }
.cart-checkout {
  height: 40px; padding: 0 20px; border-radius: 20px; background: #1a2332;
  color: #fff; font-size: 14px; font-weight: 600; border: none; cursor: pointer; white-space: nowrap;
}
</style>
