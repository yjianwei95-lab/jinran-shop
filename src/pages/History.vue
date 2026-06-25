<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">浏览记录</span>
      <span class="nav-clear" @click="clearHistory">清除</span>
    </div>

    <!-- ═══ 按日期分组 ═══ -->
    <div v-for="(group, date) in groupedHistory" :key="date" class="history-group">
      <div class="history-date">{{ date }}</div>
      <div v-for="item in group" :key="item.id" class="history-item" @click="goProduct(item.id)">
        <div class="history-img">{{ item.emoji }}</div>
        <div class="history-info">
          <div class="history-name">{{ item.name }}</div>
          <div class="history-price">¥{{ item.price }}</div>
          <div class="history-time">{{ item.time }}</div>
        </div>
      </div>
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <div class="icon">👣</div>
      <div class="text">暂无浏览记录</div>
      <button class="btn btn-primary" style="margin-top:20px" @click="$router.push('/home')">去逛逛</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTime = ref('')

const items = ref([
  { id: 1, name: '天然水晶手链', price: 128, emoji: '💎', date: '今天', time: '20:30' },
  { id: 2, name: '轻奢石英腕表', price: 399, emoji: '⌚', date: '今天', time: '19:15' },
  { id: 3, name: '国风礼盒套装', price: 188, emoji: '👑', date: '昨天', time: '14:22' },
  { id: 4, name: '925银戒指', price: 99, emoji: '💍', date: '昨天', time: '11:05' },
  { id: 5, name: '玛瑙手串', price: 88, emoji: '📿', date: '2026-06-22', time: '16:40' },
])

const groupedHistory = computed(() => {
  const groups = {}
  items.value.forEach(item => {
    const key = item.date
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return groups
})

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => { updateTime(); timeInterval = setInterval(updateTime, 60000) })
onUnmounted(() => { clearInterval(timeInterval) })

function goProduct(id) { router.push('/product/' + id) }
function clearHistory() {
  items.value = []
}
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }
.nav-clear { font-size: 14px; color: #9a9aaa; cursor: pointer; }

.history-group { padding: 12px 16px 0; }
.history-date { font-size: 14px; font-weight: 600; color: #4a4a5a; margin-bottom: 8px; }
.history-item {
  display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #e8e8e5; cursor: pointer;
}
.history-item:last-child { border-bottom: none; }
.history-img {
  width: 60px; height: 60px; border-radius: 8px; background: #f5f4f0;
  display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
}
.history-info { flex: 1; min-width: 0; }
.history-name { font-size: 14px; font-weight: 600; color: #1a2332; }
.history-price { font-size: 15px; font-weight: 700; color: #c8a45c; margin-top: 2px; }
.history-time { font-size: 11px; color: #9a9aaa; }
</style>
