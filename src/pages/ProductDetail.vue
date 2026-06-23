<template>
  <div class="page product-detail">
    <div class="back-btn" @click="$router.back()">‹ 返回</div>

    <div class="product-banner">{{ product?.name?.charAt(0) || '?' }}</div>

    <div class="detail-body">
      <div class="price-row">
        <span class="price">¥{{ product?.price }}</span>
        <span v-if="product?.original_price" class="original-price">¥{{ product?.original_price }}</span>
      </div>
      <h2 class="detail-name">{{ product?.name }}</h2>
      <p class="detail-desc">{{ product?.description || '暂无描述' }}</p>
      <div class="detail-meta">已售 {{ product?.sales_count || 0 }} 件</div>
    </div>

    <div class="buy-bar">
      <div class="buy-price">¥{{ product?.price }}</div>
      <button class="btn btn-primary" @click="addToCart">加入购物车</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'

const route = useRoute()
const router = useRouter()
const showToast = inject('showToast')
const cartCount = inject('cartCount')
const product = ref(null)

onMounted(async () => {
  const res = await api.getProduct(route.params.id)
  if (res.success) product.value = res.product
})

async function addToCart() {
  if (!product.value) return
  const res = await api.addToCart(product.value.id, 1)
  if (res.success) {
    showToast('已加入购物车')
    cartCount.value++
  } else {
    showToast(res.error || '添加失败')
  }
}
</script>

<style scoped>
.back-btn {
  position: sticky; top: 0; z-index: 10;
  background: white; padding: 12px 16px; font-size: 16px;
  border-bottom: 1px solid var(--border); cursor: pointer;
}
.product-banner {
  width: 100%; height: 300px;
  background: linear-gradient(135deg, #fef0ef, #fde8e8);
  display: flex; align-items: center; justify-content: center;
  font-size: 80px; color: var(--primary);
}
.detail-body { padding: 16px; background: white; }
.price-row { margin-bottom: 8px; }
.price { font-size: 28px; font-weight: 700; color: var(--primary); }
.original-price { font-size: 16px; color: #bbb; text-decoration: line-through; margin-left: 8px; }
.detail-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.detail-desc { font-size: 14px; color: #666; line-height: 1.6; }
.detail-meta { font-size: 13px; color: #999; margin-top: 12px; }
.buy-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: white; padding: 12px 16px;
  display: flex; align-items: center; justify-content: space-between;
  border-top: 1px solid var(--border);
  z-index: 100;
}
.buy-price { font-size: 22px; font-weight: 700; color: var(--primary); }
</style>
