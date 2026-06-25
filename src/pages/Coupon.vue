<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">优惠券</span>
      <span class="nav-tabs">
        <span :class="{ active: tab === 'available' }" @click="tab = 'available'">可用</span>
        <span :class="{ active: tab === 'used' }" @click="tab = 'used'">已使用</span>
        <span :class="{ active: tab === 'expired' }" @click="tab = 'expired'">已过期</span>
      </span>
    </div>

    <div class="coupon-list">
      <div v-for="c in filteredCoupons" :key="c.id" class="coupon-card" :class="{ used: c.used, expired: c.expired }">
        <div class="coupon-left">
          <div class="coupon-amount"><span class="coupon-symbol">¥</span>{{ c.amount }}</div>
          <div class="coupon-condition">{{ c.condition }}</div>
        </div>
        <div class="coupon-right">
          <div class="coupon-title">{{ c.title }}</div>
          <div class="coupon-desc">{{ c.desc }}</div>
          <div class="coupon-expiry">{{ c.expiry }}</div>
          <button v-if="!c.used && !c.expired" class="coupon-btn" @click="useCoupon(c)">立即使用</button>
          <span v-else class="coupon-status">{{ c.used ? '已使用' : '已过期' }}</span>
        </div>
      </div>
    </div>

    <div v-if="filteredCoupons.length === 0" class="empty-state">
      <div class="icon">🎫</div>
      <div class="text">{{ emptyText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTime = ref('')
const tab = ref('available')

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => { updateTime(); timeInterval = setInterval(updateTime, 60000) })
onUnmounted(() => { clearInterval(timeInterval) })

const coupons = ref([
  { id: 1, amount: 20, condition: '满199可用', title: '新人专享券', desc: '全场通用（部分除外）', expiry: '有效期至 2026-07-24', used: false, expired: false },
  { id: 2, amount: 50, condition: '满399可用', title: '会员满减券', desc: '限饰品品类', expiry: '有效期至 2026-07-15', used: false, expired: false },
  { id: 3, amount: 100, condition: '满699可用', title: '大额券', desc: '限腕表/轻奢品类', expiry: '有效期至 2026-07-10', used: false, expired: false },
  { id: 4, amount: 10, condition: '无门槛', title: '无门槛券', desc: '全场通用', expiry: '有效期至 2026-07-01', used: true, expired: false },
  { id: 5, amount: 30, condition: '满199可用', title: '周年庆券', desc: '限时特惠商品可用', expiry: '有效期至 2026-06-01', used: false, expired: true },
])

const filteredCoupons = computed(() => {
  if (tab.value === 'available') return coupons.value.filter(c => !c.used && !c.expired)
  if (tab.value === 'used') return coupons.value.filter(c => c.used)
  return coupons.value.filter(c => c.expired)
})

const emptyText = computed(() => {
  if (tab.value === 'available') return '暂无可用优惠券'
  if (tab.value === 'used') return '暂无已使用优惠券'
  return '暂无已过期优惠券'
})

function useCoupon(c) {
  router.push('/category')
}
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }
.nav-tabs { display: flex; gap: 16px; }
.nav-tabs span { font-size: 14px; color: #9a9aaa; cursor: pointer; }
.nav-tabs span.active { color: #1a2332; font-weight: 600; position: relative; }
.nav-tabs span.active::after {
  content: ''; position: absolute; bottom: -12px; left: 0; right: 0;
  height: 2px; background: #c8a45c;
}

.coupon-list { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.coupon-card {
  display: flex; background: #fff; border-radius: 10px; overflow: hidden;
  position: relative;
}
.coupon-card.used { opacity: 0.6; }
.coupon-card.expired { opacity: 0.5; }
.coupon-left {
  width: 100px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  background: linear-gradient(135deg, #1a2332, #2c3a50);
  padding: 16px 0;
}
.coupon-amount { font-size: 28px; font-weight: 800; color: #c8a45c; }
.coupon-symbol { font-size: 16px; vertical-align: super; }
.coupon-condition { font-size: 11px; color: rgba(255,255,255,0.6); }
.coupon-right {
  flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px;
}
.coupon-title { font-size: 15px; font-weight: 600; color: #1a2332; }
.coupon-desc { font-size: 12px; color: #9a9aaa; }
.coupon-expiry { font-size: 11px; color: #b0b0be; }
.coupon-btn {
  margin-top: 6px; width: 90px; height: 30px; border-radius: 15px;
  background: #c8a45c; color: #fff; font-size: 12px; font-weight: 600;
  border: none; cursor: pointer; align-self: flex-end;
}
.coupon-status { font-size: 12px; color: #9a9aaa; text-align: right; margin-top: 6px; }
</style>
