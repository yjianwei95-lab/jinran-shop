<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">收货地址</span>
      <span class="nav-add" @click="openEditor()">＋ 添加</span>
    </div>

    <!-- ═══ 地址列表 ═══ -->
    <div v-if="list.length > 0" class="addr-list">
      <div v-for="addr in list" :key="addr.id" class="addr-card" @click="selectAddr(addr)">
        <div class="addr-top">
          <div class="addr-name">{{ addr.name }}</div>
          <div class="addr-phone">{{ addr.phone }}</div>
          <span v-if="addr.is_default" class="addr-default-tag">默认</span>
          <div class="addr-actions" @click.stop>
            <span class="addr-edit-btn" @click.stop="openEditor(addr)">✏️</span>
            <span class="addr-del-btn" @click.stop="deleteAddr(addr)">🗑️</span>
          </div>
        </div>
        <div class="addr-region">{{ addr.region }}</div>
        <div class="addr-detail">{{ addr.detail }}</div>
      </div>
    </div>

    <!-- ═══ 空状态 ═══ -->
    <div v-else class="empty-state">
      <div class="icon">📍</div>
      <div class="text">暂无收货地址</div>
      <button class="btn btn-primary" style="margin-top:20px" @click="openEditor()">添加收货地址</button>
    </div>

    <!-- ═══ 地址编辑弹窗 ═══ -->
    <div v-if="showEditor" class="modal-overlay" @click.self="closeEditor">
      <div class="modal-content">
        <div class="modal-handle"></div>
        <h3 style="margin-bottom:20px;font-size:18px">{{ editingAddr ? '编辑地址' : '新增地址' }}</h3>

        <div class="input-group">
          <label>收件人</label>
          <input v-model="form.name" type="text" placeholder="请输入收件人姓名" />
        </div>
        <div class="input-group">
          <label>手机号</label>
          <input v-model="form.phone" type="tel" placeholder="请输入手机号" maxlength="11" />
        </div>
        <div class="input-group">
          <label>所在地区</label>
          <input v-model="form.region" type="text" placeholder="例如：河南省济源市" />
        </div>
        <div class="input-group">
          <label>详细地址</label>
          <input v-model="form.detail" type="text" placeholder="街道、门牌号等" />
        </div>

        <div class="form-row">
          <label style="font-size:14px;font-weight:600;color:#1a2332">设为默认地址</label>
          <div class="settings-toggle" :class="{ on: form.is_default }" @click="form.is_default = !form.is_default">
            <div class="toggle-dot"></div>
          </div>
        </div>

        <button class="btn btn-primary btn-block btn-lg" style="margin-top:20px" @click="saveAddr">
          {{ editingAddr ? '保存修改' : '保存地址' }}
        </button>
        <button class="btn btn-outline btn-block" style="margin-top:10px" @click="closeEditor">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api.js'

const route = useRoute()
const showToast = inject('showToast')
const currentTime = ref('')

const list = ref([])
const showEditor = ref(false)
const editingAddr = ref(null)
const form = ref({ name: '', phone: '', region: '', detail: '', is_default: false })

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => { updateTime(); timeInterval = setInterval(updateTime, 60000); loadList() })
onUnmounted(() => { clearInterval(timeInterval) })

async function loadList() {
  try {
    const res = await api.getAddresses()
    if (res.success) list.value = res.addresses || []
  } catch (e) {
    // offline fallback
    list.value = [
      { id: 1, name: '张先生', phone: '155****0010', region: '河南省 济源市', detail: '济源大道 88 号建然百货', is_default: true },
      { id: 2, name: '李女士', phone: '188****6638', region: '河南省 郑州市 金水区', detail: '花园路 66 号 3 单元 502', is_default: false },
    ]
  }
}

function openEditor(addr = null) {
  if (addr) {
    editingAddr.value = addr
    form.value = { name: addr.name, phone: addr.phone, region: addr.region, detail: addr.detail, is_default: addr.is_default }
  } else {
    editingAddr.value = null
    form.value = { name: '', phone: '', region: '', detail: '', is_default: false }
  }
  showEditor.value = true
}

function closeEditor() { showEditor.value = false; editingAddr.value = null }

async function saveAddr() {
  if (!form.value.name.trim()) { showToast('请输入收件人'); return }
  if (!form.value.phone.trim() || form.value.phone.length < 11) { showToast('请输入正确的手机号'); return }
  if (!form.value.region.trim()) { showToast('请输入所在地区'); return }
  if (!form.value.detail.trim()) { showToast('请输入详细地址'); return }

  try {
    const res = await api.saveAddress({ ...form.value, id: editingAddr.value?.id })
    if (res.success) {
      showToast(editingAddr.value ? '地址已更新' : '地址已添加')
      showEditor.value = false
      loadList()
    } else {
      showToast(res.error || '保存失败')
    }
  } catch (e) {
    // 后端不可用时本地保存
    if (editingAddr.value) {
      Object.assign(editingAddr.value, form.value)
    } else {
      list.value.push({ id: Date.now(), ...form.value })
    }
    showToast('保存成功')
    showEditor.value = false
  }
}

async function deleteAddr(addr) {
  try {
    const res = await api.deleteAddress(addr.id)
    if (res.success) {
      showToast('已删除')
      loadList()
    } else {
      showToast(res.error || '删除失败')
    }
  } catch (e) {
    list.value = list.value.filter(a => a.id !== addr.id)
    showToast('已删除')
  }
}

function selectAddr(addr) {
  if (route.query.select === 'true') {
    localStorage.setItem('selected_address', JSON.stringify(addr))
    history.back()
  }
}
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }
.nav-add { font-size: 14px; color: #c8a45c; cursor: pointer; font-weight: 600; }

.addr-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.addr-card {
  background: #fff; border-radius: 10px; padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04); cursor: pointer;
}
.addr-top { display: flex; align-items: center; gap: 8px; }
.addr-name { font-size: 15px; font-weight: 600; color: #1a2332; }
.addr-phone { font-size: 14px; color: #4a4a5a; }
.addr-default-tag {
  font-size: 10px; color: #c8a45c; background: rgba(200,164,92,0.1);
  padding: 1px 8px; border-radius: 8px; font-weight: 600;
}
.addr-actions { margin-left: auto; display: flex; gap: 8px; }
.addr-edit-btn, .addr-del-btn { cursor: pointer; font-size: 16px; opacity: 0.6; }
.addr-region { font-size: 13px; color: #9a9aaa; margin-top: 6px; }
.addr-detail { font-size: 13px; color: #4a4a5a; margin-top: 2px; }

/* Toggle */
.settings-toggle {
  width: 44px; height: 26px; border-radius: 13px;
  background: #ddd; position: relative; cursor: pointer; transition: 0.2s;
}
.settings-toggle.on { background: #c8a45c; }
.toggle-dot {
  width: 22px; height: 22px; border-radius: 11px; background: #fff;
  position: absolute; top: 2px; left: 2px; transition: 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.settings-toggle.on .toggle-dot { left: 20px; }

.form-row {
  display: flex; align-items: center; justify-content: space-between; margin-top: 16px;
}
</style>
