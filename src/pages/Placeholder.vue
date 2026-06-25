<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="placeholder-nav">
      <span class="placeholder-back" @click="$router.back()">← 返回</span>
      <span class="placeholder-title">{{ pageTitle }}</span>
      <span></span>
    </div>
    <div class="empty-state">
      <div class="icon">🚧</div>
      <div class="text">功能开发中，敬请期待...</div>
      <button class="btn btn-primary" style="margin-top:24px" @click="$router.back()">返回上一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTime = ref('')

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => { updateTime(); timeInterval = setInterval(updateTime, 60000) })
onUnmounted(() => { clearInterval(timeInterval) })

const pageTitle = route.meta?.title || '功能'
</script>

<style scoped>
.placeholder-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
}
.placeholder-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.placeholder-title { font-size: 17px; font-weight: 600; color: #1a2332; }
</style>
