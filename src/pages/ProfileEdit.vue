<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">个人资料</span>
      <span class="nav-save" @click="saveProfile">保存</span>
    </div>

    <!-- ═══ 头像（真实相册） ═══ -->
    <div class="avatar-section" @click="pickImage">
      <div class="avatar-wrap">
        <img v-if="avatarDataUrl" :src="avatarDataUrl" class="avatar-img-real" />
        <div v-else class="avatar-img-placeholder">{{ displayName }}</div>
        <div class="avatar-camera">📷</div>
      </div>
      <div class="avatar-hint">点击从相册选择头像</div>
    </div>

    <!-- ═══ 隐藏的文件选择器 ═══ -->
    <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileSelected" />

    <!-- ═══ 基本信息 ═══ -->
    <div class="form-section">
      <div class="form-item">
        <span class="form-label">昵称</span>
        <input v-model="formData.nickname" class="form-input" placeholder="请输入昵称" />
      </div>
      <div class="form-item">
        <span class="form-label">手机号</span>
        <input v-model="formData.phone" class="form-input" type="tel" placeholder="请输入手机号" maxlength="11" />
      </div>
      <div class="form-item">
        <span class="form-label">性别</span>
        <div class="gender-select">
          <span class="gender-option" :class="{ active: formData.gender === 'male' }" @click="formData.gender = 'male'">🙋 男</span>
          <span class="gender-option" :class="{ active: formData.gender === 'female' }" @click="formData.gender = 'female'">🙋‍♀️ 女</span>
        </div>
      </div>
      <div class="form-item">
        <span class="form-label">生日</span>
        <input v-model="formData.birthday" class="form-input" type="date" />
      </div>
    </div>

    <!-- ═══ 账号信息（只读） ═══ -->
    <div class="form-section">
      <div class="form-item">
        <span class="form-label">用户名</span>
        <span class="form-readonly">{{ user?.username || '-' }}</span>
      </div>
      <div class="form-item">
        <span class="form-label">会员等级</span>
        <span class="form-readonly" style="color:#c8a45c">黄金会员</span>
      </div>
      <div class="form-item">
        <span class="form-label">注册时间</span>
        <span class="form-readonly">2026-01-15</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const user = inject('user')
const showToast = inject('showToast')
const currentTime = ref('')
const fileInput = ref(null)

const avatarDataUrl = ref('')
const formData = ref({
  nickname: '',
  phone: '',
  gender: 'male',
  birthday: '',
})

const displayName = computed(() => {
  const c = (formData.value.nickname || user.value?.nickname || user.value?.username || '?').charAt(0)
  return c
})

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  if (user.value) {
    formData.value.nickname = user.value.nickname || user.value.username || ''
    formData.value.phone = user.value.phone || ''
    if (user.value.avatar) avatarDataUrl.value = user.value.avatar
  }
})
onUnmounted(() => { clearInterval(timeInterval) })

function pickImage() {
  fileInput.value?.click()
}

function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // 验证图片大小（限制 5MB）
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片过大，请选择 5MB 以内的图片')
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarDataUrl.value = ev.target?.result
  }
  reader.readAsDataURL(file)

  // 清空 input 以便重复选择同一文件
  e.target.value = ''
}

async function saveProfile() {
  if (!formData.value.nickname.trim()) { showToast('请输入昵称'); return }

  try {
    const res = await api.updateProfile({
      nickname: formData.value.nickname,
      phone: formData.value.phone,
      gender: formData.value.gender,
      birthday: formData.value.birthday,
      avatar: avatarDataUrl.value,
    })
    if (res.success) {
      user.value = { ...user.value, ...formData.value, avatar: avatarDataUrl.value }
      showToast('保存成功')
      router.back()
    } else {
      showToast(res.error || '保存失败')
    }
  } catch (e) {
    // 后端不可用时本地保存
    user.value = { ...user.value, ...formData.value, avatar: avatarDataUrl.value }
    showToast('保存成功')
    router.back()
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
.nav-save { font-size: 15px; color: #c8a45c; cursor: pointer; font-weight: 600; }

/* ═══ 头像 ═══ */
.avatar-section {
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 0 24px; background: #fff; cursor: pointer;
}
.avatar-wrap { position: relative; }
.avatar-img-real {
  width: 80px; height: 80px; border-radius: 40px;
  object-fit: cover; border: 2px solid #e8e8e5;
}
.avatar-img-placeholder {
  width: 80px; height: 80px; border-radius: 40px;
  background: #f5f4f0; display: flex; align-items: center;
  justify-content: center; font-size: 32px; color: #1a2332; font-weight: 700;
}
.avatar-camera {
  position: absolute; bottom: 0; right: -4px;
  width: 28px; height: 28px; border-radius: 14px;
  background: #c8a45c; display: flex; align-items: center;
  justify-content: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.avatar-hint { font-size: 12px; color: #9a9aaa; margin-top: 8px; }

/* ═══ 表单 ═══ */
.form-section { background: #fff; margin: 12px 16px; border-radius: 12px; overflow: hidden; }
.form-item {
  display: flex; align-items: center; padding: 14px 16px;
  border-bottom: 1px solid #e8e8e5; min-height: 48px;
}
.form-item:last-child { border-bottom: none; }
.form-label { font-size: 14px; color: #4a4a5a; width: 70px; flex-shrink: 0; }
.form-input {
  flex: 1; border: none; outline: none; font-size: 15px; color: #1a2332;
  background: transparent; font-family: inherit;
}
.form-input::placeholder { color: #b0b0be; }
.form-readonly { font-size: 15px; color: #9a9aaa; }

/* ═══ 性别选择 ═══ */
.gender-select { display: flex; gap: 10px; }
.gender-option {
  padding: 6px 16px; border-radius: 16px; font-size: 14px;
  background: #f5f4f0; color: #4a4a5a; cursor: pointer;
}
.gender-option.active { background: #1a2332; color: #fff; }
</style>
