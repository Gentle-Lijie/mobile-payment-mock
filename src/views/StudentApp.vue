<template>
  <section class="page">
    <header class="section-header">
      <div>
        <p class="eyebrow">学生端</p>
        <h1>移动支付钱包 · 场景识别 & 支付联动</h1>
        <p class="subtitle">位置+NFC 场景切换、支付-定位联动、余额变动、预警提示</p>
      </div>
      <div class="pill">当前场景：<strong>{{ sceneLabel }}</strong></div>
    </header>

    <div class="grid">
      <div class="card wide">
        <div class="card-title">场景识别与账户调度（模拟）</div>
        <div class="scene-grid">
          <button
            v-for="scene in scenes"
            :key="scene.id"
            class="scene-btn"
            :class="{ active: currentScene === scene.id }"
            @click="switchScene(scene)"
          >
            <div class="scene-name">{{ scene.name }}</div>
            <div class="scene-desc">{{ scene.desc }}</div>
            <div class="scene-meta">
              <span>坐标：{{ scene.lat }}, {{ scene.lng }}</span>
              <span v-if="scene.nfc">NFC：公交信号检测</span>
              <span v-else>NFC：未检测</span>
            </div>
          </button>
        </div>
        <div class="map-box">
          <div class="map-head">
            <div>
              <p class="eyebrow">虚拟定位</p>
              <h3>{{ activeLocation.label }}</h3>
              <p class="coords">{{ activeLocation.lat }}, {{ activeLocation.lng }}</p>
            </div>
            <div class="badge">{{ sceneLabel }} · 已激活 {{ activeAccountLabel }}</div>
          </div>
          <div class="map-body">
            <div class="pin">📍</div>
            <div class="orbit"></div>
          </div>
        </div>
      </div>

      <div class="card">
          <div class="card-title">账户余额</div>
        <div class="balances">
          <div v-for="acc in accountList" :key="acc.id" class="balance" :class="{ highlight: activeAccount === acc.id }">
            <div class="label">{{ acc.label }}</div>
            <div class="value">¥ {{ acc.balance.toFixed(2) }}</div>
            <div class="muted">限额：{{ acc.limit }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">支付-定位联动（模拟扣费）</div>
        <div class="form">
          <label class="field">
            <span>消费金额</span>
            <input v-model.number="payAmount" type="number" step="0.5" min="0" />
          </label>
          <label class="field">
            <span>备注</span>
            <input v-model="note" placeholder="如：公交支付 / 校园餐饮" />
          </label>
          <button class="primary" @click="mockPay">执行支付并联动定位</button>
          <p class="hint">完成后会生成“支付-定位联动数据”条目，附带经纬度与时间戳。</p>
        </div>
        <div v-if="lastVoucher" class="voucher">
          <div class="voucher-head">交易成功凭证</div>
          <div class="voucher-body">
            <div>金额：¥ {{ lastVoucher.amount.toFixed(2) }}</div>
            <div>账户：{{ lastVoucher.accountLabel }}</div>
            <div>时间：{{ lastVoucher.time }}</div>
            <div>位置：{{ lastVoucher.lat }}, {{ lastVoucher.lng }}</div>
            <div>场景：{{ lastVoucher.scene }}</div>
            <div>流水号：{{ lastVoucher.id }}</div>
          </div>
        </div>
      </div>

      <div class="card wide">
        <div class="card-title">支付-定位联动数据（最近记录）</div>
        <div class="timeline">
          <div v-for="item in logs" :key="item.id" class="log-item">
            <div class="dot"></div>
            <div>
              <div class="log-head">{{ item.scene }} · ¥ {{ item.amount.toFixed(2) }} · {{ item.accountLabel }}</div>
              <div class="log-meta">{{ item.time }} ｜ {{ item.lat }}, {{ item.lng }} ｜ {{ item.note }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">异常预警</div>
        <ul class="alerts">
          <li v-for="alert in alerts" :key="alert.id" :class="alert.level">
            <div class="alert-head">
              <span class="badge">{{ alert.level.toUpperCase() }}</span>
              <span>{{ alert.title }}</span>
            </div>
            <div class="alert-meta">时间：{{ alert.time }} ｜ 位置：{{ alert.lat }}, {{ alert.lng }}</div>
            <div class="alert-meta">依据：{{ alert.reason }}</div>
          </li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title">行为推送</div>
        <div class="timeline">
          <div v-for="msg in pushes" :key="msg.id" class="log-item">
            <div class="dot" :class="'lv-' + msg.level"></div>
            <div>
              <div class="log-head">[{{ msg.level.toUpperCase() }}] {{ msg.title }}</div>
              <div class="log-meta">{{ msg.time }} ｜ {{ msg.detail }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { store, setScene } from '../state'

const scenes = store.scenes

const accountList = reactive([
  { id: 'campus', label: '校园消费账户', balance: 120.5, limit: '单笔 ¥200' },
  { id: 'bus', label: '公交支付账户', balance: 35.0, limit: '单笔 ¥20' },
  { id: 'social', label: '社会支付账户', balance: 560.0, limit: '单笔 ¥500' },
])

const activeAccount = ref('campus')
const payAmount = ref(2.5)
const note = ref('公交支付')
const logs = ref([])
const lastVoucher = ref(null)

const sceneLabel = computed(() => {
  const s = scenes.find((s) => s.id === store.currentScene)
  return s ? s.name : '未知场景'
})

const activeLocation = computed(() => {
  const s = scenes.find((s) => s.id === store.currentScene)
  return s ? { label: s.name, lat: s.lat, lng: s.lng } : { label: '未知', lat: '-', lng: '-' }
})

const activeAccountLabel = computed(() => {
  const a = accountList.find((a) => a.id === activeAccount.value)
  return a ? a.label : '未知账户'
})

const alerts = computed(() => store.alerts)
const pushes = computed(() => store.pushMessages)
const currentScene = computed(() => store.currentScene)

const switchScene = (scene) => {
  setScene(scene.id)
}

watch(
  () => store.currentScene,
  (id) => {
    activeAccount.value = id === 'bus' ? 'bus' : id === 'campus' ? 'campus' : 'social'
    note.value = id === 'bus' ? '公交支付' : id === 'campus' ? '校园消费' : '社会支付'
  },
  { immediate: true }
)

const mockPay = () => {
  const acc = accountList.find((a) => a.id === activeAccount.value)
  if (!acc) return
  const amount = Math.max(0, payAmount.value || 0)
  if (amount <= 0) {
    alert('请输入大于0的金额')
    return
  }
  if (acc.balance < amount) {
    alert('余额不足')
    return
  }
  acc.balance = parseFloat((acc.balance - amount).toFixed(2))
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const id = `TX-${Date.now()}`
  const loc = activeLocation.value
  const entry = {
    id,
    amount,
    accountLabel: acc.label,
    time: timestamp,
    lat: loc.lat,
    lng: loc.lng,
    scene: sceneLabel.value,
    note: note.value || '支付',
  }
  logs.value = [entry, ...logs.value].slice(0, 6)
  lastVoucher.value = entry
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  background: #0ea5e9;
  color: #0b172a;
  padding: 16px;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.25);
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.8;
}

.subtitle {
  opacity: 0.9;
}

.pill {
  background: rgba(255, 255, 255, 0.85);
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card.wide {
  grid-column: span 2;
}

.card-title {
  font-weight: 700;
  font-size: 16px;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.scene-btn {
  text-align: left;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scene-btn.active {
  border-color: #10b981;
  background: #ecfdf3;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15);
}

.scene-name {
  font-weight: 700;
}

.scene-desc {
  color: #475569;
  margin: 4px 0;
}

.scene-meta {
  font-size: 12px;
  color: #64748b;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.map-box {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
}

.map-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coords {
  opacity: 0.85;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 600;
}

.map-body {
  margin-top: 16px;
  height: 160px;
  position: relative;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), transparent 40%);
  border-radius: 12px;
}

.pin {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 26px;
}

.orbit {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border: 1px dashed rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

.balances {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.balance {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  background: #f8fafc;
}

.balance.highlight {
  border-color: #3b82f6;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.label {
  font-weight: 700;
}

.value {
  font-size: 20px;
  margin: 6px 0;
}

.muted {
  color: #64748b;
  font-size: 12px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

input {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.primary {
  background: #10b981;
  color: #0b172a;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(16, 185, 129, 0.25);
}

.hint {
  font-size: 12px;
  color: #475569;
}

.voucher {
  border: 1px dashed #10b981;
  border-radius: 12px;
  padding: 12px;
}

.voucher-head {
  font-weight: 700;
  margin-bottom: 8px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-item {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 8px;
  align-items: flex-start;
}

.dot {
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  margin-top: 4px;
}

.log-head {
  font-weight: 700;
}

.log-meta {
  color: #475569;
  font-size: 13px;
}

.alerts {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alerts li {
  border-radius: 12px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.alerts li.high {
  border-color: #f97316;
  background: #fff7ed;
}

.alerts li.medium {
  border-color: #f59e0b;
  background: #fffbeb;
}

.dot.lv-info {
  background: #0ea5e9;
}

.dot.lv-medium {
  background: #f59e0b;
}

.dot.lv-high {
  background: #f97316;
}

.dot.lv-critical {
  background: #ef4444;
}

.alert-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.alert-meta {
  font-size: 13px;
  color: #475569;
}

.badge {
  background: rgba(255, 255, 255, 0.25);
}

@media (max-width: 768px) {
  .card.wide {
    grid-column: span 1;
  }
}
</style>
