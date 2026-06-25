<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">关于我们</span>
      <span></span>
    </div>

    <div class="about-header">
      <div class="about-logo">💎</div>
      <div class="about-brand">建伟饰品</div>
      <div class="about-version">当前版本 v4.0.0</div>
    </div>

    <div class="section-block">
      <div class="about-section">
        <div class="about-section-title">品牌介绍</div>
        <div class="about-text">
          建伟饰品成立于2020年，总部位于河南济源，是一家专注于精品饰品设计、生产与销售的电商品牌。
          我们坚持"用心甄选、品质至上"的理念，致力于为每一位顾客提供优雅精致、物超所值的饰品体验。
        </div>
      </div>
      <div class="about-section">
        <div class="about-section-title">联系我们</div>
        <div class="about-contact">
          <div class="contact-row"><span class="contact-key">客服热线</span><span class="contact-val">400-888-6666</span></div>
          <div class="contact-row"><span class="contact-key">客服邮箱</span><span class="contact-val">service@jianwei.com</span></div>
          <div class="contact-row"><span class="contact-key">工作时间</span><span class="contact-val">周一至周日 9:00-22:00</span></div>
          <div class="contact-row"><span class="contact-key">公司地址</span><span class="contact-val">河南省济源市济源建然百货商行</span></div>
        </div>
      </div>
      <div class="about-section">
        <div class="about-section-title">更多信息</div>
        <div class="about-links">
          <div class="about-link" @click="showToast('用户协议')">用户协议</div>
          <div class="about-link" @click="showToast('隐私政策')">隐私政策</div>
          <div class="about-link" @click="showToast('营业执照')">营业执照</div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-text">建伟饰品 © 2026</div>
      <div class="footer-text" style="font-size:10px;margin-top:4px">济源建然百货商行</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'

const showToast = inject('showToast')
const currentTime = ref('')

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => { updateTime(); timeInterval = setInterval(updateTime, 60000) })
onUnmounted(() => { clearInterval(timeInterval) })
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }

.about-header {
  display: flex; flex-direction: column; align-items: center;
  padding: 40px 20px 24px; gap: 8px;
}
.about-logo { font-size: 64px; }
.about-brand { font-size: 24px; font-weight: 800; color: #1a2332; }
.about-version { font-size: 13px; color: #9a9aaa; }

.about-section { padding: 16px 0; border-bottom: 1px solid #e8e8e5; }
.about-section:last-child { border-bottom: none; }
.about-section-title { font-size: 15px; font-weight: 600; color: #1a2332; margin-bottom: 10px; }
.about-text { font-size: 14px; color: #4a4a5a; line-height: 1.8; }

.contact-row { display: flex; padding: 6px 0; font-size: 14px; }
.contact-key { color: #9a9aaa; width: 80px; flex-shrink: 0; }
.contact-val { color: #4a4a5a; }

.about-links { display: flex; gap: 16px; }
.about-link { font-size: 14px; color: #c8a45c; cursor: pointer; }
</style>
