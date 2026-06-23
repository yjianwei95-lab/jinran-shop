<template>
  <div class="page">
    <div class="page-header"><h1>🛒 购物车</h1></div>
    <div v-if="items.length === 0" class="empty-state">
      <div class="icon">🛒</div>
      <div class="text">购物车是空的</div>
      <div style="margin-top:16px"><button class="btn btn-primary" @click="$router.push('/home')">去逛逛</button></div>
    </div>
    <div v-else class="cart-list">
      <div v-for="item in items" :key="item.id" class="cart-item">
        <div class="cart-img">{{ item.product_name?.charAt(0) || '?' }}</div>
        <div class="cart-info">
          <div class="cart-name">{{ item.product_name }}</div>
          <div class="cart-price">¥{{ item.price }}</div>
        </div>
        <div class="qty-selector">
          <button @click="changeQty(item, -1)">−</button>
          <span>{{ item.quantity }}</span>
          <button @click="changeQty(item, 1)">+</button>
        </div>
      </div>
      <div class="cart-footer">
        <div class="cart-total">合计: <span style="color:var(--primary);font-size:20px;font-weight:700">¥{{ total }}</span></div>
        <button class="btn btn-primary btn-lg" style="width:160px" @click="checkout">去结算</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const showToast = inject('showToast')
const cartCount = inject('cartCount')
const items = ref([])

onMounted(loadCart)

async function loadCart() {
  const res = await api.getCart()
  if (res.success) {
    items.value = res.items || []
    cartCount.value = items.value.reduce((s, i) => s + i.quantity, 0)
  }
}

const total = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2))

async function changeQty(item, delta) {
  const newQty = item.quantity + delta
  if (newQty < 1) return
  const res = await api.updateCart(item.id, newQty)
  if (res.success) {
    item.quantity = newQty
    cartCount.value = items.value.reduce((s, i) => s + i.quantity, 0)
  }
}

function checkout() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) { router.push('/login?redirect=checkout'); return }
  router.push('/checkout')
}
</script>

<style scoped>
.cart-list { padding: 12px 16px; }
.cart-item { display: flex; align-items: center; gap: 12px; background: white; border-radius: 12px; padding: 12px; margin-bottom: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.cart-img { width: 64px; height: 64px; border-radius: 8px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #ddd; flex-shrink: 0; }
.cart-info { flex: 1; min-width: 0; }
.cart-name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cart-price { color: var(--primary); font-weight: 700; font-size: 15px; margin-top: 4px; }
.cart-footer { position: sticky; bottom: 56px; background: white; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); }
.cart-total { font-size: 15px; }
</style>
