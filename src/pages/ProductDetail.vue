<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>

    <div class="detail-nav">
      <span class="detail-back" @click="$router.back()">← 返回</span>
      <div class="detail-nav-icons">
        <span class="detail-share" @click="share">📤</span>
        <span class="detail-more">···</span>
      </div>
    </div>

    <div class="detail-gallery">
      <div class="gallery-main">
        <span class="gallery-emoji">{{ product.emoji || '💎' }}</span>
        <div class="gallery-nav">
          <span v-for="(img, i) in product.images || [product.emoji]" :key="i"
            class="gallery-dot" :class="{ active: galleryIndex === i }"
            @click="galleryIndex = i"></span>
        </div>
      </div>
    </div>

    <div class="detail-info">
      <h1 class="detail-title">{{ product.name }}</h1>
      <div class="detail-price-row">
        <span class="detail-price">¥{{ product.price }}</span>
        <span v-if="product.original_price" class="detail-original-price">¥{{ product.original_price }}</span>
        <span v-if="product.sales_count" class="detail-sales">已售 {{ product.sales_count }}</span>
      </div>

      <div class="detail-tags">
        <span class="tag-item tag-discount">限时特惠</span>
        <span class="tag-item tag-ship">满99包邮</span>
        <span class="tag-item tag-return">7天退换</span>
      </div>

      <div class="detail-section">
        <div class="section-title">商品详情</div>
        <div class="detail-desc">{{ product.description || '暂无描述' }}</div>
      </div>

      <!-- 规格选择 -->
      <div class="detail-section" style="background:#faf8f5">
        <div class="section-title" style="color:#c8a45c;font-size:14px">▼ 选择规格 ▼</div>
        <div style="padding:8px 0 2px">
          <div class="spec-label">🎨 颜色</div>
          <div class="spec-options" style="margin-top:4px">
            <div v-for="s in specs" :key="s.name"
              class="spec-tag" :class="{ active: activeColor === s.name }"
              @click="activeColor = s.name">{{ s.name }}</div>
          </div>
        </div>
        <div style="padding:2px 0 8px">
          <div class="spec-label">📏 链长</div>
          <div class="spec-options" style="margin-top:4px">
            <div v-for="m in sizes" :key="m.name"
              class="spec-tag" :class="{ active: activeSize === m.name }"
              @click="activeSize = m.name">{{ m.name }}</div>
          </div>
        </div>
      </div>

      <div class="detail-qty">
        <span class="qty-label">数量</span>
        <div class="qty-selector">
          <button @click="qty > 1 && qty--">−</button>
          <span>{{ qty }}</span>
          <button @click="qty++">+</button>
        </div>
      </div>

      <!-- ═══ 购买按钮（商品详情与商品参数之间） ═══ -->
      <div style="display:flex;gap:10px;padding:12px 20px">
        <button class="btn-inline btn-cart-inline" @click="addToCart">🛒 加入购物车</button>
        <button class="btn-inline btn-buy-inline" @click="buyNow">⚡ 立即购买</button>
      </div>

      <div class="detail-section">
        <div class="section-title">商品参数</div>
        <div class="detail-params">
          <div class="param-row"><span class="param-key">品牌</span><span class="param-val">建伟饰品</span></div>
          <div class="param-row"><span class="param-key">材质</span><span class="param-val">{{ product.material || '优质合金/天然石' }}</span></div>
          <div class="param-row"><span class="param-key">风格</span><span class="param-val">{{ product.style || '简约时尚' }}</span></div>
          <div class="param-row"><span class="param-key">适用人群</span><span class="param-val">女士</span></div>
          <div class="param-row"><span class="param-key">发货地</span><span class="param-val">河南济源</span></div>
          <div class="param-row"><span class="param-key">发货时间</span><span class="param-val">24小时内发货</span></div>
          <div class="param-row"><span class="param-key">售后服务</span><span class="param-val">7天退换，假一赔十</span></div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">买家评价 ({{ reviews.length }})</div>
        <div v-if="reviews.length > 0">
          <div v-for="(r, i) in reviews" :key="i" class="review-item">
            <div class="review-user">{{ r.user }}</div>
            <div class="review-stars">{{ '⭐'.repeat(r.stars) }}</div>
            <div class="review-text">{{ r.text }}</div>
          </div>
        </div>
        <div v-else class="review-empty">暂无评价</div>
      </div>
    </div>

    <!-- ═══ 底部收藏栏（精简） ═══ -->
    <div class="detail-action-bar">
      <div class="detail-fav" @click="toggleFav">
        <span>{{ isFav ? '❤️' : '🤍' }}</span>
        <span class="fav-label">收藏</span>
      </div>
      <div class="detail-fav" @click="$router.push('/cart')">
        <span>🛒</span>
        <span class="fav-label">购物车</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'

const currentTime = ref('')
const galleryIndex = ref(0)
const route = useRoute()
const router = useRouter()
const showToast = inject('showToast')

const qty = ref(1)
const isFav = ref(false)
const activeColor = ref('金色')
const activeSize = ref('链长40cm')

const product = ref({
  id: 0, name: '简约珍珠锁骨链 天然淡水珍珠',
  price: '39.90', original_price: '69.90',
  emoji: '💎', sales_count: 203,
  material: '天然淡水珍珠+925银镀金', style: '简约优雅',
  description: '精选天然淡水珍珠，颗颗饱满圆润。925银镀金链条，亲肤不过敏。锁骨链设计，修饰颈部线条，简约优雅适合日常佩戴。',
})

const specs = ref([{ name: '金色' }, { name: '银色' }, { name: '玫瑰金' }])
const sizes = ref([{ name: '链长40cm' }, { name: '链长45cm' }, { name: '链长50cm' }])

const reviews = ref([
  { user: '小***花', stars: 5, text: '很漂亮的项链，珍珠光泽很好，配送也快！' },
  { user: '爱***鱼', stars: 4, text: '做工精细，戴着很显气质，朋友都说好看' },
  { user: '星***空', stars: 5, text: '第二次买了，送闺蜜她也特别喜欢' },
])

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  const id = route.params.id
  if (id) {
    try {
      const res = await api.getProduct(id)
      if (res.success) product.value = { ...product.value, ...res.product }
    } catch (e) { /* offline */ }
  }
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  isFav.value = favs.includes(Number(route.params.id))
})
onUnmounted(() => { clearInterval(timeInterval) })

function toggleFav() {
  isFav.value = !isFav.value
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  const id = Number(route.params.id)
  if (isFav.value) { favs.push(id) } else { favs.splice(favs.indexOf(id), 1) }
  localStorage.setItem('favorites', JSON.stringify(favs))
  showToast(isFav.value ? '已收藏 ❤️' : '已取消收藏')
}

function addToCart() {
  const item = makeCartItem()
  const items = JSON.parse(localStorage.getItem('cart_items') || '[]')
  const exist = items.find(i => i.id === item.id && i.color === item.color && i.size === item.size)
  if (exist) { exist.quantity += item.quantity }
  else { items.push(item) }
  localStorage.setItem('cart_items', JSON.stringify(items))
  showToast('✓ 已加入购物车')
}

function buyNow() {
  localStorage.setItem('checkout_now', JSON.stringify([makeCartItem()]))
  router.push('/checkout')
}

function makeCartItem() {
  return {
    id: product.value.id, name: product.value.name,
    price: Number(product.value.price), emoji: product.value.emoji,
    color: activeColor.value, size: activeSize.value,
    quantity: qty.value, checked: true,
  }
}

function share() {
  if (navigator.share) {
    navigator.share({ title: product.value.name, text: product.value.description, url: window.location.href })
  } else {
    navigator.clipboard?.writeText(window.location.href)
    showToast('链接已复制')
  }
}
</script>

<style scoped>
.detail-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.detail-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.detail-nav-icons { display: flex; gap: 12px; }
.detail-share, .detail-more { font-size: 20px; cursor: pointer; color: #1a2332; }

.detail-gallery {
  width: 100%; height: 375px; background: #f5f4f0;
  display: flex; align-items: center; justify-content: center; position: relative;
}
.gallery-emoji { font-size: 80px; }
.gallery-nav {
  position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 6px;
}
.gallery-dot { width: 6px; height: 6px; border-radius: 3px; background: rgba(0,0,0,0.2); cursor: pointer; }
.gallery-dot.active { width: 18px; background: #1a2332; }

.detail-info {
  background: #fff; border-radius: 16px 16px 0 0; margin-top: -16px;
  padding: 20px; position: relative;
}
.detail-title { font-size: 18px; font-weight: 700; color: #1a2332; line-height: 1.4; margin-bottom: 10px; }
.detail-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
.detail-price { font-size: 30px; font-weight: 700; color: #c8a45c; }
.detail-original-price { font-size: 14px; color: #9a9aaa; text-decoration: line-through; }
.detail-sales { font-size: 12px; color: #b0b0be; margin-left: auto; }
.detail-tags { display: flex; gap: 8px; margin-bottom: 14px; }
.tag-item { font-size: 10px; padding: 2px 10px; border-radius: 8px; font-weight: 600; }
.tag-discount { background: #fef2f2; color: #ef4444; }
.tag-ship { background: #f0fdf4; color: #22c55e; }
.tag-return { background: #fefce8; color: #eab308; }

.detail-section { border-top: 8px solid #f5f4f0; margin: 0 -20px; padding: 16px 20px; }
.section-title { font-size: 16px; font-weight: 700; color: #1a2332; margin-bottom: 10px; }
.detail-desc { font-size: 14px; color: #4a4a5a; line-height: 1.8; }

.spec-label { font-size: 13px; color: #4a4a5a; font-weight: 600; }
.spec-options { display: flex; gap: 10px; flex-wrap: wrap; }
.spec-tag {
  height: 34px; padding: 0 20px; border-radius: 17px;
  background: #fff; border: 1px solid #e8e8e5;
  display: flex; align-items: center; font-size: 13px; color: #1a2332; cursor: pointer;
}
.spec-tag.active { background: #1a2332; color: #fff; border-color: #1a2332; font-weight: 600; }

.detail-qty { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-top: 1px solid #e8e8e5; }
.qty-label { font-size: 14px; color: #4a4a5a; font-weight: 600; }
.qty-selector { display: inline-flex; align-items: center; border: 1px solid #e8e8e5; border-radius: 4px; }
.qty-selector button { width: 32px; height: 32px; border: none; background: #f9f9f9; font-size: 16px; cursor: pointer; color: #4a4a5a; }
.qty-selector span { width: 38px; text-align: center; font-size: 14px; font-weight: 600; }

.param-row { display: flex; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f5f4f0; }
.param-row:last-child { border-bottom: none; }
.param-key { color: #9a9aaa; width: 80px; flex-shrink: 0; }
.param-val { color: #4a4a5a; }

.review-item { padding: 10px 0; border-bottom: 1px solid #f5f4f0; }
.review-user { font-size: 12px; color: #9a9aaa; margin-bottom: 2px; }
.review-stars { font-size: 12px; margin-bottom: 4px; }
.review-text { font-size: 13px; color: #4a4a5a; line-height: 1.6; }
.review-empty { font-size: 13px; color: #b0b0be; text-align: center; padding: 20px; }

.detail-action-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; background: #fff; border-top: 1px solid #e8e8e5;
}
.detail-fav { width: 44px; display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; font-size: 20px; }
.fav-label { font-size: 10px; color: #9a9aaa; }

/* ═══ 内联购买按钮 ═══ */
.btn-inline { flex: 1; height: 48px; border-radius: 24px; border: none; font-size: 15px; font-weight: 700; cursor: pointer; }
.btn-cart-inline { background: #2c3a50; color: #fff; }
.btn-buy-inline { background: #c8a45c; color: #fff; }
.btn-inline:active { opacity: 0.85; }
</style>
