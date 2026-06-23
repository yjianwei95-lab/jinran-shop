<template>
  <div class="tab-bar">
    <div v-for="tab in tabs" :key="tab.path"
      class="tab-item"
      :class="{ active: currentTab === tab.path }"
      @click="go(tab.path)">
      <div style="position:relative">
        <span class="tab-icon">{{ tab.icon }}</span>
        <span v-if="tab.badge && tab.badge > 0" class="tab-badge">{{ tab.badge > 99 ? '99+' : tab.badge }}</span>
      </div>
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const cartCount = inject('cartCount')

const tabs = computed(() => [
  { path: '/home', label: '首页', icon: '🏠' },
  { path: '/category', label: '分类', icon: '📂' },
  { path: '/cart', label: '购物车', icon: '🛒', badge: cartCount.value },
  { path: '/profile', label: '我的', icon: '👤' },
])

const currentTab = computed(() => route.path)

function go(path) {
  router.push(path)
}
</script>
