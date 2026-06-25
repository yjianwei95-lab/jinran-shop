<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">设置</span>
      <span></span>
    </div>

    <!-- ═══ 个人资料 ═══ -->
    <div class="settings-group">
      <div class="settings-group-title">个人资料</div>
      <div class="settings-item" @click="editProfile">
        <span class="settings-icon">👤</span>
        <span class="settings-label">个人资料</span>
        <span class="settings-arrow">›</span>
      </div>
      <div class="settings-item" @click="$router.push('/address')">
        <span class="settings-icon">📍</span>
        <span class="settings-label">收货地址</span>
        <span class="settings-arrow">›</span>
      </div>
    </div>

    <!-- ═══ 通知设置 ═══ -->
    <div class="settings-group">
      <div class="settings-group-title">通知设置</div>
      <div class="settings-item">
        <span class="settings-icon">🔔</span>
        <span class="settings-label">推送通知</span>
        <div class="settings-toggle" :class="{ on: pushNotify }" @click="pushNotify = !pushNotify">
          <div class="toggle-dot"></div>
        </div>
      </div>
      <div class="settings-item">
        <span class="settings-icon">📩</span>
        <span class="settings-label">短信通知</span>
        <div class="settings-toggle" :class="{ on: smsNotify }" @click="smsNotify = !smsNotify">
          <div class="toggle-dot"></div>
        </div>
      </div>
    </div>

    <!-- ═══ 缓存与存储 ═══ -->
    <div class="settings-group">
      <div class="settings-group-title">缓存与存储</div>
      <div class="settings-item" @click="clearCache">
        <span class="settings-icon">🧹</span>
        <span class="settings-label">清除缓存</span>
        <span class="settings-value">{{ cacheSize }}</span>
        <span class="settings-arrow">›</span>
      </div>
    </div>

    <!-- ═══ 服务器设置 ═══ -->
    <div class="settings-group">
      <div class="settings-group-title">服务器设置</div>
      <div class="settings-item" @click="showServerDialog = true">
        <span class="settings-icon">🌐</span>
        <span class="settings-label">服务器地址</span>
        <span class="settings-value" style="font-size:11px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ serverUrl }}</span>
        <span class="settings-arrow">›</span>
      </div>
    </div>

    <!-- ═══ 服务器地址弹窗 ═══ -->
    <div v-if="showServerDialog" class="modal-overlay" @click.self="showServerDialog = false">
      <div class="modal-content">
        <div class="modal-handle"></div>
        <h3 style="margin-bottom:16px;font-size:18px">设置服务器地址</h3>
        <div class="input-group">
          <label>API 地址</label>
          <input v-model="editServerUrl" type="url" placeholder="http://192.168.1.155:3001" />
        </div>
        <p style="font-size:12px;color:#9a9aaa;margin-bottom:16px">
          💡 电脑启动后端后，可通过 <strong>localhost.run</strong> 或 <strong>ngrok</strong> 获取公网地址
        </p>
        <button class="btn btn-primary btn-block" @click="saveServerUrl">保存</button>
        <button class="btn btn-outline btn-block" style="margin-top:8px" @click="showServerDialog = false">取消</button>
      </div>
    </div>

    <!-- ═══ 其他 ═══ -->
    <div class="settings-group">
      <div class="settings-group-title">其他</div>
      <div class="settings-item" @click="$router.push('/about')">
        <span class="settings-icon">ℹ️</span>
        <span class="settings-label">关于我们</span>
        <span class="settings-value">v2.7.0</span>
        <span class="settings-arrow">›</span>
      </div>
      <div class="settings-item" @click="checkUpdate">
        <span class="settings-icon">🔄</span>
        <span class="settings-label">检查更新</span>
        <span class="settings-arrow">›</span>
      </div>
    </div>

    <!-- ═══ 退出 ═══ -->
    <div v-if="user" class="settings-logout" @click="logout">退出登录</div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showToast = inject('showToast')
const user = inject('user')
const currentTime = ref('')

const pushNotify = ref(true)
const smsNotify = ref(false)
const cacheSize = ref('12.5 MB')
const showServerDialog = ref(false)
const serverUrl = ref(localStorage.getItem('api_base_url') || 'http://192.168.1.155:3001')
const editServerUrl = ref(serverUrl.value)

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => { updateTime(); timeInterval = setInterval(updateTime, 60000) })
onUnmounted(() => { clearInterval(timeInterval) })

function editProfile() { router.push('/profile-edit') }
function clearCache() { cacheSize.value = '0 B'; showToast('缓存已清除') }
function checkUpdate() { showToast('已是最新版本') }
function saveServerUrl() {
  if (!editServerUrl.value.trim()) { showToast('请输入地址'); return }
  localStorage.setItem('api_base_url', editServerUrl.value.trim())
  serverUrl.value = editServerUrl.value.trim()
  showServerDialog.value = false
  showToast('服务器地址已更新，重启APP生效')
}
function logout() {
  user.value = null
  showToast('已退出登录')
  router.push('/home')
}
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }

.settings-group { background: #fff; margin: 12px 16px; border-radius: 12px; overflow: hidden; }
.settings-group-title {
  font-size: 13px; font-weight: 600; color: #9a9aaa;
  padding: 14px 16px 6px;
}
.settings-item {
  display: flex; align-items: center; padding: 14px 16px;
  border-bottom: 1px solid #e8e8e5; cursor: pointer;
}
.settings-item:last-child { border-bottom: none; }
.settings-icon { font-size: 20px; margin-right: 12px; width: 24px; text-align: center; }
.settings-label { flex: 1; font-size: 15px; color: #1a2332; }
.settings-value { font-size: 13px; color: #9a9aaa; margin-right: 8px; }
.settings-arrow { font-size: 18px; color: #c0c0cc; }

/* ═══ Toggle Switch ═══ */
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

.settings-logout {
  text-align: center; padding: 20px; margin: 24px 16px;
  background: #fff; border-radius: 12px; color: #ef4444; font-size: 15px; cursor: pointer;
}
</style>
