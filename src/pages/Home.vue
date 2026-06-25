<template>
  <div class="page">
    <!-- ═══ 状态栏 ═══ -->
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>

    <!-- ═══ 品牌头部 ═══ -->
    <div class="brand-header">
      <div class="brand-content">
        <div class="brand-greeting">✦ 欢迎光临</div>
        <div class="brand-name">建伟饰品</div>
        <div class="brand-tagline">精品饰品 · 用心甄选</div>
      </div>
    </div>

    <!-- ═══ 搜索栏 ═══ -->
    <div class="search-section">
      <div class="search-input" @click="$router.push('/category')">
        <span class="icon">🔍</span>
        <span class="placeholder">搜索饰品、百货...</span>
      </div>
    </div>

    <!-- ═══ 商品分类 ═══ -->
    <div class="section-block">
      <div class="section-title" style="margin-bottom:12px">商品分类</div>
      <div class="category-grid">
        <div v-for="cat in categories" :key="cat.id" class="cat-item" @click="goCategory(cat.slug)">
          <div class="cat-icon-wrap">{{ cat.icon }}</div>
          <div class="cat-name">{{ cat.name }}</div>
        </div>
      </div>
    </div>

    <!-- ═══ 限时特惠 ═══ -->
    <div class="flash-section" @click="goFlashSale">
      <div class="flash-content">
        <div class="flash-left">
          <span class="flash-tag">限时特惠</span>
          <span class="flash-title">精选好物限时折扣</span>
          <span class="flash-sub">品质生活，从此刻开始</span>
        </div>
        <div class="flash-right">
          <div class="flash-clock">
            <span class="flash-num">{{ flashH }}</span>
            <span class="flash-colon">:</span>
            <span class="flash-num">{{ flashM }}</span>
            <span class="flash-colon">:</span>
            <span class="flash-num">{{ flashS }}</span>
          </div>
          <span class="flash-hint">限时抢购</span>
        </div>
      </div>
    </div>

    <!-- ═══ 推荐好物 ═══ -->
    <div class="section-block">
      <div class="section-header">
        <div class="section-header-left">
          <span>🔥</span>
          <span class="section-title">推荐好物</span>
          <span class="section-badge">热销</span>
        </div>
        <span class="section-more" @click="goAll('featured')">全部 →</span>
      </div>
      <div class="product-grid">
        <div v-for="p in featured" :key="p.id" class="product-card" @click="goProduct(p.id)">
          <div class="img-wrap">{{ p.emoji || p.name.charAt(0) }}</div>
          <div class="info">
            <div class="name">{{ p.name }}</div>
            <div class="price-row">
              <span class="price">¥{{ p.price }}</span>
              <span v-if="p.original_price" class="original-price">¥{{ p.original_price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 近期上新 ═══ -->
    <div class="section-block">
      <div class="section-header">
        <div class="section-header-left">
          <span>🆕</span>
          <span class="section-title">近期上新</span>
          <span class="section-badge section-badge-dark">新品</span>
        </div>
        <span class="section-more" @click="goAll('new')">查看更多 →</span>
      </div>
      <div class="product-grid">
        <div v-for="p in newProducts" :key="p.id" class="product-card" @click="goProduct(p.id)">
          <div class="img-wrap">{{ p.emoji || p.name.charAt(0) }}</div>
          <div class="info">
            <div class="name">{{ p.name }}</div>
            <div class="price-row">
              <span class="price">¥{{ p.price }}</span>
              <span v-if="p.original_price" class="original-price">¥{{ p.original_price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 品质承诺 ═══ -->
    <div class="section-block">
      <div class="promise-grid">
        <div v-for="p in promises" :key="p.id" class="promise-item">
          <span class="icon">{{ p.icon }}</span>
          <div class="promise-text">
            <span class="promise-title">{{ p.title }}</span>
            <span class="promise-desc">{{ p.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 底部版权 ═══ -->
    <div class="footer-bar">
      <div class="footer-text">建伟饰品 © 2026</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const currentTime = ref('')
const router = useRouter()

// 分类数据（饰品店铺专属类目）
const categories = ref([
  { id: 1, slug: 'necklace', name: '项链吊坠', icon: '💎' },
  { id: 2, slug: 'earring', name: '耳饰系列', icon: '✨' },
  { id: 3, slug: 'bracelet', name: '手链手镯', icon: '📿' },
  { id: 4, slug: 'ring', name: '戒指对戒', icon: '💍' },
  { id: 5, slug: 'hair', name: '精美发饰', icon: '🎀' },
  { id: 6, slug: 'set', name: '套装礼盒', icon: '🎁' },
  { id: 7, slug: 'silver', name: '银饰专区', icon: '⭐' },
  { id: 8, slug: 'watch', name: '腕表系列', icon: '⌚' },
])

// 推荐商品
const featured = ref([
  { id: 1, name: '简约珍珠锁骨链', price: 39.9, original_price: 69.9, emoji: '💎' },
  { id: 2, name: '925银戒指', price: 99, original_price: 199, emoji: '💍' },
])

// 新品
const newProducts = ref([
  { id: 3, name: '轻奢礼盒套装', price: 188, original_price: 368, emoji: '🎁' },
  { id: 4, name: '纯银手镯', price: 139, original_price: 259, emoji: '⭐' },
])

// 品质承诺
const promises = ref([
  { id: 1, icon: '🚚', title: '品质保证', desc: '正品保障 假一赔十' },
  { id: 2, icon: '🔄', title: '免费退换', desc: '7天退换 无忧购物' },
  { id: 3, icon: '📦', title: '快递包邮', desc: '满99包邮 极速发货' },
  { id: 4, icon: '💬', title: '专属客服', desc: '1对1服务 在线咨询' },
])

// 倒计时
const flashH = ref('00')
const flashM = ref('00')
const flashS = ref('00')
let timeInterval = null
let flashTimer = null

function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

function startFlashCountdown() {
  const end = new Date()
  end.setHours(23, 59, 59, 0)
  function tick() {
    const diff = Math.max(0, Math.floor((end - Date.now()) / 1000))
    flashH.value = String(Math.floor(diff / 3600)).padStart(2, '0')
    flashM.value = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
    flashS.value = String(diff % 60).padStart(2, '0')
  }
  tick()
  flashTimer = setInterval(tick, 1000)
}

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  startFlashCountdown()
  try {
    const res = await api.getFeatured()
    if (res.success && res.products) featured.value = res.products.slice(0, 4)
    const all = await api.getProducts('all')
    if (all.success && all.products) {
      const sorted = [...all.products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      newProducts.value = sorted.slice(0, 4)
    }
  } catch (e) { /* offline mode */ }
})

onUnmounted(() => { clearInterval(timeInterval); clearInterval(flashTimer) })

function goCategory(slug) { router.push('/category?cat=' + slug) }
function goProduct(id) { router.push('/product/' + id) }
function goFlashSale() { router.push('/category') }
function goAll(type) { router.push('/category') }
</script>
