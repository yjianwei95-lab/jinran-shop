<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>

    <!-- ═══ 搜索栏 ═══ -->
    <div class="cat-search">
      <span class="cat-search-icon">🔍</span>
      <input v-model="searchQuery" class="cat-search-input" placeholder="搜一搜当前分类..." @input="debounceSearch" />
      <span v-if="searchQuery" class="cat-clear" @click="clearSearch">✕</span>
    </div>

    <div class="cat-layout">
      <!-- 左侧分类侧栏 -->
      <div class="cat-sidebar">
        <div v-for="c in categories" :key="c.slug"
          class="cat-side-item"
          :class="{ active: activeCat === c.slug }"
          @click="switchCat(c.slug)">
          <span class="cat-side-icon">{{ c.icon }}</span>
          <span class="cat-side-name">{{ c.name }}</span>
        </div>
      </div>

      <!-- 右侧商品内容 -->
      <div class="cat-content">
        <!-- 分类标题 + 排序/切换 -->
        <div class="cat-toolbar">
          <div class="cat-title">{{ currentCatName }}</div>
          <div class="cat-actions">
            <span class="cat-view-btn" @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'">
              {{ viewMode === 'grid' ? '📋' : '🔲' }}
            </span>
          </div>
        </div>

        <!-- 排序栏 -->
        <div class="cat-sort-bar">
          <span class="sort-item" :class="{ active: sortBy === 'default' }" @click="sortBy = 'default'">默认</span>
          <span class="sort-item" :class="{ active: sortBy === 'price-asc' }" @click="sortBy = 'price-asc'">价格 ↑</span>
          <span class="sort-item" :class="{ active: sortBy === 'price-desc' }" @click="sortBy = 'price-desc'">价格 ↓</span>
          <span class="sort-item" :class="{ active: sortBy === 'sales' }" @click="sortBy = 'sales'">销量</span>
          <span class="sort-item" :class="{ active: sortBy === 'newest' }" @click="sortBy = 'newest'">新品</span>
        </div>

        <!-- 搜索结果提示 -->
        <div v-if="searchQuery" class="cat-search-result">
          搜索 "{{ searchQuery }}" 找到 {{ sortedProducts.length }} 个商品
        </div>

        <div v-if="sortedProducts.length === 0" class="empty-state">
          <div class="icon">📦</div>
          <div class="text">暂无商品</div>
        </div>

        <!-- 网格模式 -->
        <div v-else-if="viewMode === 'grid'" class="cat-product-grid">
          <div v-for="p in sortedProducts" :key="p.id" class="cat-product-card" @click="goProduct(p.id)">
            <div class="img-wrap">{{ p.emoji || p.name.charAt(0) }}</div>
            <div class="info">
              <div class="name">{{ p.name }}</div>
              <div class="price-row">
                <span class="price">¥{{ p.price }}</span>
                <span v-if="p.original_price" class="original-price">¥{{ p.original_price }}</span>
              </div>
              <div class="card-actions">
                <span class="sales-count">已售 {{ p.sales_count || 0 }}</span>
                <span class="quick-add" @click.stop="quickAdd(p)">＋</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表模式 -->
        <div v-else class="cat-list-view">
          <div v-for="p in sortedProducts" :key="p.id" class="cat-list-item" @click="goProduct(p.id)">
            <div class="list-img">{{ p.emoji || p.name.charAt(0) }}</div>
            <div class="list-info">
              <div class="list-name">{{ p.name }}</div>
              <div v-if="p.description" class="list-desc">{{ p.description }}</div>
              <div class="list-price-row">
                <span class="list-price">¥{{ p.price }}</span>
                <span v-if="p.original_price" class="list-original">¥{{ p.original_price }}</span>
              </div>
              <div class="list-meta">
                <span>已售 {{ p.sales_count || 0 }}</span>
                <span>库存 {{ p.stock || '充足' }}</span>
              </div>
            </div>
            <span class="list-add" @click.stop="quickAdd(p)">＋</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'

const currentTime = ref('')
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const sortBy = ref('default')
const viewMode = ref('grid')
let searchTimer = null
let timeInterval = null

function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

const categories = ref([
  { slug: 'necklace', name: '项链吊坠', icon: '💎' },
  { slug: 'earring', name: '耳饰系列', icon: '✨' },
  { slug: 'bracelet', name: '手链手镯', icon: '📿' },
  { slug: 'ring', name: '戒指对戒', icon: '💍' },
  { slug: 'hair', name: '精美发饰', icon: '🎀' },
  { slug: 'set', name: '套装礼盒', icon: '🎁' },
  { slug: 'silver', name: '银饰专区', icon: '⭐' },
  { slug: 'watch', name: '腕表系列', icon: '⌚' },
])

const products = ref([])
const activeCat = ref('necklace')

const currentCatName = computed(() => {
  const c = categories.value.find(c => c.slug === activeCat.value)
  return c ? c.name : ''
})

const sortedProducts = computed(() => {
  let list = [...products.value]

  // 搜索过滤
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q))
  }

  // 排序
  if (sortBy.value === 'price-asc') list.sort((a, b) => a.price - b.price)
  else if (sortBy.value === 'price-desc') list.sort((a, b) => b.price - a.price)
  else if (sortBy.value === 'sales') list.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))

  return list
})

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  if (route.query.cat) activeCat.value = route.query.cat
  loadProducts()
})

async function loadProducts() {
  try {
    const res = await api.getProducts(activeCat.value)
    if (res.success && res.products.length > 0) {
      products.value = res.products.map(p => ({
        ...p,
        emoji: getCategoryEmoji(p.category_id)
      }))
    } else {
      fallbackProducts()
    }
  } catch (e) {
    fallbackProducts()
  }
}

function fallbackProducts() {
  const data = {
    necklace: [
      { id: 1, name: '简约珍珠锁骨链', price: 39.9, original_price: 69.9, emoji: '💎', sales_count: 203, stock: 80, description: '天然淡水珍珠，精致锁骨链' },
      { id: 2, name: '星月吊坠项链', price: 59.9, original_price: 99.9, emoji: '⭐', sales_count: 156, stock: 60, description: '925银镀金，星月相伴' },
    ],
    earring: [
      { id: 3, name: '珍珠耳钉套装', price: 29.9, original_price: 49.9, emoji: '✨', sales_count: 312, stock: 120, description: '3mm天然珍珠耳钉，三色可选' },
      { id: 4, name: '流苏耳环', price: 45, original_price: 79, emoji: '💫', sales_count: 98, stock: 45, description: '法式复古流苏耳环，摇曳生姿' },
    ],
    bracelet: [
      { id: 5, name: '水晶手链', price: 88, original_price: 168, emoji: '💎', sales_count: 186, stock: 50, description: '天然紫水晶，时尚百搭' },
      { id: 6, name: '玛瑙手串', price: 68, original_price: 128, emoji: '📿', sales_count: 134, stock: 40, description: '天然玛瑙，温润如玉' },
    ],
    ring: [
      { id: 7, name: '925银戒指', price: 99, original_price: 199, emoji: '💍', sales_count: 234, stock: 100, description: '纯银打造，不易过敏，素圈款' },
      { id: 8, name: '莫桑石戒指', price: 169, original_price: 299, emoji: '💎', sales_count: 89, stock: 30, description: '天然莫桑石，闪耀如钻' },
    ],
    hair: [
      { id: 9, name: '水晶发夹套装', price: 35, original_price: 55, emoji: '🎀', sales_count: 167, stock: 90, description: '水晶发夹五件套，光泽亮丽' },
      { id: 10, name: '珍珠发箍', price: 25, original_price: 45, emoji: '👑', sales_count: 98, stock: 70, description: '珍珠点缀，优雅气质' },
    ],
    set: [
      { id: 11, name: '轻奢礼盒套装', price: 188, original_price: 368, emoji: '🎁', sales_count: 67, stock: 25, description: '项链+耳钉+手链三件套，精美礼盒' },
      { id: 12, name: '闺蜜饰品礼盒', price: 128, original_price: 228, emoji: '🎀', sales_count: 45, stock: 30, description: '双人饰品套装，适合送礼' },
    ],
    silver: [
      { id: 13, name: '纯银手镯', price: 139, original_price: 259, emoji: '⭐', sales_count: 156, stock: 45, description: '999足银，素面推拉款' },
      { id: 14, name: '银质吊坠', price: 79, original_price: 149, emoji: '🌟', sales_count: 112, stock: 55, description: 'S925银镶嵌锆石，闪耀动人' },
    ],
    watch: [
      { id: 15, name: '轻奢石英腕表', price: 199, original_price: 399, emoji: '⌚', sales_count: 78, stock: 30, description: '简约表盘，真皮表带' },
      { id: 16, name: '时尚满天星腕表', price: 159, original_price: 299, emoji: '⌚', sales_count: 134, stock: 45, description: '锆石表盘，钢带女款' },
    ],
  }
  products.value = data[activeCat.value] || [
    { id: 0, name: '精品好物', price: 39.9, original_price: 59.9, emoji: '🌟', sales_count: 50, stock: 99, description: '用心甄选，品质保证' },
  ]
}

function getCategoryEmoji(catId) {
  const map = { 2: '💎', 3: '🎁', 4: '📦' }
  return map[catId] || '🛍️'
}

function debounceSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {}, 300)
}

function clearSearch() { searchQuery.value = '' }

async function switchCat(slug) {
  activeCat.value = slug
  searchQuery.value = ''
  sortBy.value = 'default'
  loadProducts()
}

function quickAdd(p) {
  const items = JSON.parse(localStorage.getItem('cart_items') || '[]')
  const exist = items.find(i => i.id === p.id)
  if (exist) exist.quantity = (exist.quantity || 1) + 1
  else items.unshift({ id: p.id, name: p.name, price: p.price, emoji: p.emoji, quantity: 1 })
  localStorage.setItem('cart_items', JSON.stringify(items))
  // 显示一个小提示
  const toast = document.createElement('div')
  toast.textContent = '✓ 已加入购物车'
  toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.75);color:#fff;padding:10px 20px;border-radius:8px;font-size:14px;z-index:9999;animation:fadeInOut 1.2s'
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 1200)
}

function goProduct(id) { router.push('/product/' + id) }
onUnmounted(() => { clearInterval(timeInterval) })
</script>

<style scoped>
/* ═══ 搜索栏 ═══ */
.cat-search {
  display: flex; align-items: center; gap: 8px;
  margin: 8px 12px; padding: 0 12px;
  background: #fff; border-radius: 20px; height: 36px;
}
.cat-search-icon { font-size: 14px; }
.cat-search-input {
  flex: 1; border: none; outline: none; font-size: 13px; color: #1a2332; background: transparent;
}
.cat-clear { font-size: 14px; color: #9a9aaa; cursor: pointer; }

/* ═══ 布局 ═══ */
.cat-layout { display: flex; height: calc(100vh - 44px - 56px - 52px); }

/* ═══ 侧栏 ═══ */
.cat-sidebar {
  width: 80px; background: #fff; border-right: 1px solid #e8e8e5; overflow-y: auto; padding-top: 4px;
}
.cat-side-item {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 12px 4px; cursor: pointer; border-left: 3px solid transparent;
  font-size: 20px;
}
.cat-side-item .cat-side-name { font-size: 10px; color: #4a4a5a; }
.cat-side-item.active { background: #fef0ef; border-left-color: #1a2332; }
.cat-side-item.active .cat-side-name { color: #1a2332; font-weight: 600; }

/* ═══ 工具栏 ═══ */
.cat-content { flex: 1; overflow-y: auto; padding: 12px; }
.cat-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.cat-title { font-size: 16px; font-weight: 700; color: #1a2332; }
.cat-view-btn { font-size: 18px; cursor: pointer; }

/* ═══ 排序栏 ═══ */
.cat-sort-bar { display: flex; gap: 0; margin-bottom: 10px; background: #fff; border-radius: 8px; overflow: hidden; }
.sort-item {
  flex: 1; text-align: center; padding: 8px 0; font-size: 12px; color: #9a9aaa; cursor: pointer; border-bottom: 2px solid transparent;
}
.sort-item.active { color: #1a2332; font-weight: 600; border-bottom-color: #c8a45c; }

.cat-search-result { font-size: 12px; color: #9a9aaa; margin-bottom: 8px; }

/* ═══ 网格模式 ═══ */
.cat-product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.cat-product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; }
.cat-product-card .img-wrap { width: 100%; height: 100px; background: #f5f4f0; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.cat-product-card .info { padding: 6px 8px 8px; }
.cat-product-card .name { font-size: 12px; font-weight: 600; color: #1a2332; }
.price-row { display: flex; align-items: baseline; gap: 4px; margin-top: 2px; }
.price { font-size: 14px; font-weight: 700; color: #1a2332; }
.original-price { font-size: 10px; color: #9a9aaa; text-decoration: line-through; }
.card-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.sales-count { font-size: 10px; color: #b0b0be; }
.quick-add {
  width: 22px; height: 22px; border-radius: 11px; background: #1a2332;
  color: #fff; font-size: 14px; display: flex; align-items: center; justify-content: center; font-weight: 700;
}

/* ═══ 列表模式 ═══ */
.cat-list-view { display: flex; flex-direction: column; gap: 8px; }
.cat-list-item {
  display: flex; gap: 10px; background: #fff; border-radius: 8px; padding: 10px; cursor: pointer; align-items: center;
}
.list-img { width: 72px; height: 72px; border-radius: 6px; background: #f5f4f0; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.list-info { flex: 1; min-width: 0; }
.list-name { font-size: 14px; font-weight: 600; color: #1a2332; }
.list-desc { font-size: 11px; color: #9a9aaa; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.list-price-row { display: flex; align-items: baseline; gap: 4px; margin-top: 2px; }
.list-price { font-size: 16px; font-weight: 700; color: #1a2332; }
.list-original { font-size: 11px; color: #9a9aaa; text-decoration: line-through; }
.list-meta { display: flex; gap: 12px; font-size: 10px; color: #b0b0be; margin-top: 2px; }
.list-add { width: 24px; height: 24px; border-radius: 12px; background: #1a2332; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
</style>
