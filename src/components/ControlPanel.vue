<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="panel">
      <header class="panel-head">
        <div>
          <p class="eyebrow">状态控制窗口</p>
          <h2>场景切换 · 行为推送 · 告警同步</h2>
          <p class="muted">此窗口独立于页面，可实时调整状态与推送多级别行为，并同步潜在告警</p>
        </div>
        <button class="close" @click="$emit('close')">关闭</button>
      </header>

      <div class="grid">
        <div class="card">
          <div class="card-title">场景切换</div>
          <p class="hint">切换后学生端当前场景与账户随之变化</p>
          <div class="scene-buttons">
            <button
              v-for="scene in store.scenes"
              :key="scene.id"
              :class="['scene-btn', { active: store.currentScene === scene.id }]"
                            @click="setScene(scene.id)"
            >
              <div class="name">{{ scene.name }}</div>
              <div class="desc">{{ scene.desc }}</div>
              <div class="meta">{{ scene.lat }}, {{ scene.lng }} · NFC: {{ scene.nfc ? '公交信号' : '未检测' }}</div>
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-title">行为推送（多级别）</div>
          <div class="form">
            <label class="field">
              <span>级别</span>
              <select v-model="push.level">
                <option value="info">信息</option>
                <option value="medium">提醒</option>
                <option value="high">重要</option>
                <option value="critical">严重</option>
              </select>
            </label>
            <label class="field">
              <span>标题</span>
              <input v-model="push.title" placeholder="如：定位异常跳变" />
            </label>
            <label class="field">
              <span>详情</span>
              <textarea v-model="push.detail" rows="3" placeholder="描述行为或异常依据"></textarea>
            </label>
            <button class="primary" @click="sendPush">推送到各页面</button>
            <p class="hint">高/严重级别会同步生成告警，出现在学生端与家长端</p>
          </div>
        </div>

        <div class="card">
          <div class="card-title">告警同步</div>
          <div class="form">
            <label class="field">
              <span>告警标题</span>
              <input v-model="alert.title" placeholder="如：跨区域交易" />
            </label>
            <label class="field">
              <span>依据</span>
              <textarea v-model="alert.reason" rows="3" placeholder="如：5分钟内跨城市消费"></textarea>
            </label>
            <label class="field">
              <span>等级</span>
              <select v-model="alert.level">
                <option value="medium">二级</option>
                <option value="high">一级</option>
              </select>
            </label>
            <button class="ghost" @click="sendAlert">直接新增告警</button>
          </div>
        </div>

                <div class="card">
                    <div class="card-title">支付 / 圈存（同步各端）</div>
                    <div class="form">
                        <label class="field">
                            <span>类型</span>
                            <select v-model="payment.type">
                                <option value="pay">支付</option>
                                <option value="topup">圈存</option>
                            </select>
                        </label>
                        <label class="field">
                            <span>商户 / 说明</span>
                            <input v-model="payment.merchant" placeholder="如：校园食堂 / 远程圈存" />
                        </label>
                        <label class="field">
                            <span>金额</span>
                            <input v-model.number="payment.amount" type="number" min="0.01" step="0.5" />
                        </label>
                        <label class="field">
                            <span>账户</span>
                            <select v-model="payment.account">
                                <option value="campus">校园消费账户</option>
                                <option value="bus">公交支付账户</option>
                                <option value="social">社会支付账户</option>
                            </select>
                        </label>
                        <label class="field">
                            <span>是否安全</span>
                            <select v-model="payment.safe">
                                <option :value="true">安全</option>
                                <option :value="false">疑似风险</option>
                            </select>
                        </label>
                        <button class="primary" @click="sendPayment">立即写入并广播</button>
                        <p class="hint">支付/圈存会写入后端列表，通过 SSE 同步到学生端与家长端。</p>
                    </div>
                </div>

       
        <div class="card">
          <div class="card-title">最近推送</div>
          <div class="list">
            <div v-for="msg in store.pushMessages" :key="msg.id" class="item">
              <div>
                <div class="strong">[{{ msg.level.toUpperCase() }}] {{ msg.title }}</div>
                <div class="muted">{{ msg.detail }}</div>
              </div>
              <div class="time">{{ msg.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
    import { store, addPush, addAlert, addPayment, setScene } from '../state'

const push = reactive({ level: 'info', title: '', detail: '' })
const alert = reactive({ title: '', reason: '', level: 'medium' })
    const payment = reactive({ type: 'pay', amount: 12, account: 'campus', merchant: '校园食堂', safe: true })

const sendPush = () => {
  addPush({ ...push })
  push.title = ''
  push.detail = ''
}

const sendAlert = () => {
  addAlert({ ...alert })
  alert.title = ''
  alert.reason = ''
}

    const sendPayment = async () => {
        const amount = Math.max(0.01, payment.amount || 0)
        await addPayment({ ...payment, amount })
    }
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 12px;
  z-index: 20;
}

.panel {
  width: min(1100px, 100%);
  background: #ffffff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.7;
}

.muted {
  color: #475569;
}

.close {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
}

.card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fdfefe;
}

.card-title {
  font-weight: 700;
}

.scene-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scene-btn {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.scene-btn.active {
  border-color: #0ea5e9;
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.2);
}

.name {
  font-weight: 700;
}

.desc {
  color: #475569;
}

.meta {
  font-size: 12px;
  color: #64748b;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

input, select, textarea {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  font: inherit;
}

.primary {
  background: #0ea5e9;
  color: #0b172a;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.ghost {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
}

.hint {
  font-size: 12px;
  color: #475569;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
}

.item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.strong {
  font-weight: 700;
}

.time {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .panel {
    padding: 14px;
  }
}
</style>
