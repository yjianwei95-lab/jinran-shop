<template>
  <div class="page">
    <div class="page-header" style="display:flex;align-items:center;gap:12px">
      <span style="cursor:pointer" @click="$router.back()">‹ 返回</span>
      <h1>收货地址</h1>
    </div>
    <div class="page-body">
      <div v-if="list.length === 0" class="empty-state">
        <div class="icon">📍</div>
        <div class="text">暂无收货地址</div>
      </div>
      <div v-for="addr in list" :key="addr.id" class="addr-card" @click="selectAddr(addr)">
        <div style="font-weight:600">{{ addr.name }} {{ addr.phone }}</div>
        <div style="font-size:13px;color:#666;margin-top:4px">{{ addr.region }} {{ addr.detail }}</div>
        <div v-if="addr.is_default" class="default-tag">默认</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'

const route = useRoute()
const router = useRouter()
const list = ref([])

onMounted(async () => {
  const res = await api.getAddresses()
  if (res.success) list.value = res.addresses || []
})

function selectAddr(addr) {
  if (route.query.select === 'true') {
    // 选择地址模式
    localStorage.setItem('selected_address', JSON.stringify(addr))
    router.back()
  }
}
</script>

<style scoped>
.addr-card { background: white; border-radius: 12px; padding: 16px; margin-bottom: 10px; position: relative; box-shadow: 0 1px 4px rgba(0,0,0,0.04); cursor: pointer; }
.default-tag { position: absolute; right: 12px; top: 12px; background: var(--primary); color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px; }
</style>
