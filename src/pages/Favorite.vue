<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">我的收藏</span>
      <span class="nav-edit" @click="editing = !editing">{{ editing ? '完成' : '编辑' }}</span>
    </div>

    <div v-if="items.length > 0" class="fav-list">
      <div v-for="item in items" :key="item.id" class="fav-item" @click="!editing && goProduct(item.id)">
        <div class="fav-check" v-if="editing" :class="{ checked: item.selected }" @click.stop="item.selected = !item.selected">
          <span v-if="item.selected">✓</span>
        </div>
        <div class="fav-img">{{ item.emoji || item.name.charAt(0) }}</div>
        <div class="fav-info">
          <div class="fav-name">{{ item.name }}</div>
          <div class="fav-price">¥{{ item.price }}</div>
          <div class="fav-time">收藏于 {{ item.time }}</div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="icon">❤️</div>
      <div class="text">还没有收藏的商品</div>
      <button class="btn btn-primary" style="margin-top:20px" @click="$router.push('/home')">去逛逛</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const currentTime = ref('')
const editing = ref(false)
const items = ref([])

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  try {
    const res = await api.getFavorites()
    if (res.success && res.products) items.value = res.products.map(p => ({ ...p, selected: false, time: '2026-06-24' }))
  } catch (e) {
    items.value = [
      { id: 1, name: '天然水晶手链', price: 128, emoji: '💎', time: '2026-06-24', selected: false },
      { id: 2, name: '轻奢石英腕表', price: 399, emoji: '⌚', time: '2026-06-23', selected: false },
    ]
  }
})
onUnmounted(() => { clearInterval(timeInterval) })

function goProduct(id) { router.push('/product/' + id) }
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }
.nav-edit { font-size: 15px; color: #9a9aaa; cursor: pointer; }

.fav-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.fav-item {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 10px; padding: 12px; cursor: pointer;
}
.fav-check {
  width: 20px; height: 20px; border-radius: 10px;
  border: 2px solid #c8a45c; display: flex; align-items: center; justify-content: center;
}
.fav-check.checked { background: #c8a45c; }
.fav-check span { color: #fff; font-size: 11px; }
.fav-img {
  width: 72px; height: 72px; border-radius: 8px;
  background: #f5f4f0; display: flex; align-items: center; justify-content: center;
  font-size: 26px; flex-shrink: 0;
}
.fav-info { flex: 1; min-width: 0; }
.fav-name { font-size: 14px; font-weight: 600; color: #1a2332; margin-bottom: 2px; }
.fav-price { font-size: 16px; font-weight: 700; color: #c8a45c; }
.fav-time { font-size: 11px; color: #9a9aaa; margin-top: 4px; }
</style>
