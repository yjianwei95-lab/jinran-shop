<template>
  <div class="page" style="padding-bottom:0">
    <div class="status-bar">
      <span class="current-time">{{ currentTime }}</span>
      <span>📶 🔋</span>
    </div>
    <div class="page-nav">
      <span class="nav-back" @click="$router.back()">← 返回</span>
      <span class="nav-title">联系客服</span>
      <span></span>
    </div>

    <!-- ═══ 快捷入口 ═══ -->
    <div class="quick-channels">
      <div class="channel-item" @click="callService">
        <span class="channel-icon">💬</span>
        <span class="channel-label">在线客服</span>
        <span class="channel-desc">9:00-22:00</span>
      </div>
      <div class="channel-item" @click="callPhone">
        <span class="channel-icon">📞</span>
        <span class="channel-label">客服热线</span>
        <span class="channel-desc">400-888-6666</span>
      </div>
    </div>

    <!-- ═══ 常见问题 ═══ -->
    <div class="section-block">
      <div class="section-title" style="margin-bottom:12px">常见问题</div>
      <div v-for="(faq, i) in faqs" :key="i" class="faq-item" @click="toggleFaq(i)">
        <div class="faq-q">
          <span>{{ faq.q }}</span>
          <span class="faq-arrow" :class="{ open: faq.open }">›</span>
        </div>
        <div v-if="faq.open" class="faq-a">{{ faq.a }}</div>
      </div>
    </div>

    <!-- ═══ 意见反馈 ═══ -->
    <div class="section-block">
      <div class="section-title" style="margin-bottom:12px">意见反馈</div>
      <textarea class="feedback-textarea" v-model="feedback" placeholder="请输入您的意见或建议..." rows="4"></textarea>
      <button class="btn btn-primary btn-block" style="margin-top:12px" @click="submitFeedback">提交反馈</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'

const showToast = inject('showToast')
const currentTime = ref('')
const feedback = ref('')

const faqs = ref([
  { q: '如何退货？', a: '签收后7天内可申请退货，商品需保持完好不影响二次销售。在"我的订单"中选择对应订单，点击"申请退款"即可。', open: false },
  { q: '发货时间是多久？', a: '现货商品下单后24小时内发货，预售商品以页面标注时间为准。', open: false },
  { q: '运费怎么计算？', a: '全场满99元包邮，不满99元收取10元运费（港澳台及偏远地区除外）。', open: false },
  { q: '如何查询物流？', a: '在"我的订单"中点击对应订单，即可查看物流跟踪信息。', open: false },
])

let timeInterval = null
function updateTime() {
  const now = new Date()
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}
onMounted(() => { updateTime(); timeInterval = setInterval(updateTime, 60000) })
onUnmounted(() => { clearInterval(timeInterval) })

function toggleFaq(i) { faqs.value[i].open = !faqs.value[i].open }
function callService() { showToast('正在转接在线客服...') }
function callPhone() { showToast('客服热线: 400-888-6666') }
function submitFeedback() {
  if (!feedback.value.trim()) { showToast('请输入内容'); return }
  showToast('感谢您的反馈！')
  feedback.value = ''
}
</script>

<style scoped>
.page-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #fff;
}
.nav-back { font-size: 16px; color: #1a2332; cursor: pointer; }
.nav-title { font-size: 17px; font-weight: 600; color: #1a2332; }

.quick-channels { display: flex; gap: 12px; padding: 16px; }
.channel-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 6px; background: #fff; border-radius: 12px; padding: 20px 16px; cursor: pointer;
}
.channel-icon { font-size: 32px; }
.channel-label { font-size: 15px; font-weight: 600; color: #1a2332; }
.channel-desc { font-size: 11px; color: #9a9aaa; }

.faq-item { border-bottom: 1px solid #e8e8e5; padding: 12px 0; }
.faq-item:last-child { border-bottom: none; }
.faq-q { display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 14px; color: #1a2332; }
.faq-arrow { font-size: 18px; color: #c0c0cc; transition: transform 0.2s; }
.faq-arrow.open { transform: rotate(90deg); }
.faq-a { font-size: 13px; color: #666; margin-top: 8px; line-height: 1.6; padding-right: 20px; }

.feedback-textarea {
  width: 100%; padding: 12px; border: 1px solid #e8e8e5;
  border-radius: 8px; font-size: 14px; resize: none; outline: none;
  font-family: inherit; box-sizing: border-box;
}
.feedback-textarea:focus { border-color: #1a2332; }
</style>
