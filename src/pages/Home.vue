<template>
  <div class="page">
    <!-- 品牌头部 -->
    <div class="home-header">
      <div class="brand-row">
        <span class="brand-logo">💎</span>
        <div>
          <div class="brand-name">建伟饰品</div>
          <div class="brand-slogan">精品饰品 · 用心甄选</div>
        </div>
      </div>
      <div class="search-bar" @click="goCategory">
        <span class="search-icon">🔍</span>
        <span class="search-text">搜索饰品...</span>
      </div>
    </div>

    <!-- 限时抢购 -->
    <div class="flash-section">
      <div class="flash-header">
        <span class="flash-title">🔥 限时抢购</span>
        <span class="flash-more" @click="goCategory">查看更多 ›</span>
      </div>
      <div class="flash-scroll">
        <div v-for="p in featured" :key="p.id" class="flash-item" @click="goProduct(p.id)">
          <div class="flash-img">{{ p.name.charAt(0) }}</div>
          <div class="flash-name">{{ p.name }}</div>
          <div class="flash-price">¥{{ p.price }}</div>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="cat-nav">
      <div v-for="c in categories" :key="c.id" class="cat-item" @click="goCategory(c.slug)">
        <div class="cat-icon">{{ catIcons[c.slug] || '📦' }}</div>
        <div class="cat-name">{{ c.name }}</div>
      </div>
    </div>

    <!-- 推荐商品 -->
    <div class="section-title">✨ 精选推荐</div>
    <div class="product-grid">
      <div v-for="p in products" :key="p.id" class="product-card" @click="goProduct(p.id)">
        <div class="img-wrap">{{ p.name.charAt(0) }}</div>
        <div class="info">
          <div class="name">{{ p.name }}</div>
          <div>
            <span class="price">¥{{ p.price }}</span>
            <span v-if="p.original_price" class="original-price">¥{{ p.original_price }}</span>
          </div>
          <div class="sales">已售 {{ p.sales_count || 0 }} 件</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const featured = ref([])
const products = ref([])
const categories = ref([])
const catIcons = { all: '📦', accessories: '💍', fashion: '🎀', daily: '🧴' }

onMounted(async () => {
  const [fRes, pRes, cRes] = await Promise.all([
    api.getFeatured(), api.getProducts(), api.getCategories()
  ])
  if (fRes.success) featured.value = fRes.products
  if (pRes.success) products.value = pRes.products
  if (cRes.success) categories.value = cRes.categories
})

function goProduct(id) { router.push('/product/' + id) }
function goCategory(slug) { router.push('/category' + (slug ? '?cat=' + slug : '')) }
</script>

<style scoped>
.home-header {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  padding: 20px 16px 16px;
  color: white;
}
.brand-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.brand-logo { font-size: 36px; }
.brand-name { font-size: 20px; font-weight: 700; }
.brand-slogan { font-size: 12px; opacity: 0.85; margin-top: 2px; }
.search-bar {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.search-icon { font-size: 16px; }
.search-text { font-size: 14px; opacity: 0.8; }
.flash-section { background: white; margin: 12px 16px; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.flash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.flash-title { font-size: 16px; font-weight: 700; }
.flash-more { font-size: 13px; color: #999; cursor: pointer; }
.flash-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
.flash-scroll::-webkit-scrollbar { display: none; }
.flash-item { min-width: 80px; text-align: center; }
.flash-img { width: 64px; height: 64px; border-radius: 50%; background: #fef0ef; display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--primary); margin: 0 auto 6px; }
.flash-name { font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 80px; }
.flash-price { color: var(--primary); font-size: 13px; font-weight: 700; }
.cat-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 12px 16px; }
.cat-item { text-align: center; cursor: pointer; }
.cat-icon { width: 48px; height: 48px; border-radius: 12px; background: white; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
.cat-name { font-size: 12px; color: #666; }
</style>
