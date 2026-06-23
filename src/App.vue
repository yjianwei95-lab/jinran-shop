<template>
  <div id="app-root">
    <router-view />
    <TabBar v-if="showTab" />
    <div v-if="toast.show" class="toast">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { computed, ref, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'

const route = useRoute()
const showTab = computed(() => route.meta?.tab !== false && !['/login'].includes(route.path))

const toast = ref({ show: false, msg: '' })
let toastTimer = null
function showToast(msg, duration = 2000) {
  clearTimeout(toastTimer)
  toast.value = { show: true, msg }
  toastTimer = setTimeout(() => { toast.value.show = false }, duration)
}
provide('showToast', showToast)

// 全局存储用户信息
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const cartCount = ref(0)
provide('user', user)
provide('cartCount', cartCount)

watch(user, (v) => {
  localStorage.setItem('user', JSON.stringify(v))
}, { deep: true })
</script>
