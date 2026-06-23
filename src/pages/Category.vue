<template>
  <div class="page">
    <div class="page-header"><h1>📂 分类</h1></div>
    <div class="cat-layout">
      <div class="cat-sidebar">
        <div v-for="c in categories" :key="c.id"
          class="cat-side-item"
          :class="{ active: activeCat === c.slug }"
          @click="switchCat(c.slug)">
          {{ c.name }}
        </div>
      </div>
      <div class="cat-content">
        <div v-if="products.length === 0" class="empty-state">
          <div class="icon">📦</div>
          <div class="text">暂无商品</div>
        </div>
        <div v-else class="product-grid">
          <div v-for="p in products" :key="p.id" class="product-card" @click="goProduct(p.id)">
            <div class="img-wrap">{{ p.name.charAt(0) }}</div>
            <div class="info">
              <div class="name">{{ p.name }}</div>
              <div>
                <span class="price">¥{{ p.price }}</span>
                <span v-if="p.original_price" class="original-price">¥{{ p.original_price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'

const route = useRoute()
const router = useRouter()
const categories = ref([])
const products = ref([])
const activeCat = ref('all')

onMounted(async () => {
  const cRes = await api.getCategories()
  if (cRes.success) categories.value = cRes.categories
  activeCat.value = route.query.cat || 'all'
  loadProducts()
})

async function loadProducts() {
  const res = await api.getProducts(activeCat.value)
  if (res.success) products.value = res.products
}

function switchCat(slug) {
  activeCat.value = slug
  loadProducts()
}

function goProduct(id) { router.push('/product/' + id) }
</script>

<style scoped>
.cat-layout { display: flex; height: calc(100vh - 56px); }
.cat-sidebar { width: 90px; background: white; border-right: 1px solid var(--border); overflow-y: auto; }
.cat-side-item {
  padding: 16px 12px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  border-left: 3px solid transparent;
}
.cat-side-item.active {
  color: var(--primary);
  font-weight: 600;
  border-left-color: var(--primary);
  background: #fef0ef;
}
.cat-content { flex: 1; overflow-y: auto; }
.product-grid { padding: 8px; gap: 8px; }
.product-card .img-wrap { aspect-ratio: 1; }
</style>
