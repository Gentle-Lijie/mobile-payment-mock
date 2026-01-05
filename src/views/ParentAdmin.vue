<template>
    <section class="page">
        <header class="section-header">
            <div>
                <p class="eyebrow">家长 / 管理端</p>
                <h1>远程圈存 · 权限调整 · 预警查看</h1>
                <p class="subtitle">发起空中圈存、查看请求响应、审阅异常预警</p>
            </div>
            <div class="pill">本地静态数据</div>
        </header>

        <div class="grid">
            <div class="card">
                <div class="card-title">空中圈存</div>
                <div class="form">
                    <label class="field">
                        <span>学生ID</span>
                        <input v-model="form.student" placeholder="如：STU-20260105" />
                    </label>
                    <label class="field">
                        <span>目标账户</span>
                        <select v-model="form.account">
                            <option value="campus">校园消费账户</option>
                            <option value="bus">公交支付账户</option>
                            <option value="social">社会支付账户</option>
                        </select>
                    </label>
                    <label class="field">
                        <span>圈存金额 (¥)</span>
                        <input v-model.number="form.amount" type="number" min="1" step="1" />
                    </label>
                    <button class="primary" @click="sendTopup">发送圈存指令</button>
                    <p class="hint">流程：家长端发指令 → RSA校验 → MPC芯片写入 → 返回圈存回执（本地静态显示）。</p>
                </div>
                <div v-if="lastTopup" class="voucher">
                    <div class="voucher-head">圈存回执</div>
                    <div class="voucher-body">
                        <div>学生：{{ lastTopup.student }}</div>
                        <div>账户：{{ mapAccount(lastTopup.account) }}</div>
                        <div>金额：¥ {{ lastTopup.amount }}</div>
                        <div>状态：{{ lastTopup.status }}</div>
                        <div>时间：{{ lastTopup.time }}</div>
                        <div>回执号：{{ lastTopup.id }}</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">权限调整（静态示例）</div>
                <div class="list">
                    <div class="item" v-for="item in policy" :key="item.id">
                        <div>
                            <div class="strong">{{ item.label }}</div>
                            <div class="muted">当前限额：{{ item.limit }}</div>
                        </div>
                        <button class="ghost">编辑</button>
                    </div>
                </div>
            </div>

            <div class="card wide">
                <div class="card-title">远程请求日志（静态）</div>
                <div class="timeline">
                    <div v-for="log in logs" :key="log.id" class="log-item">
                        <div class="dot"></div>
                        <div>
                            <div class="log-head">{{ log.type }} · {{ log.result }}</div>
                            <div class="log-meta">{{ log.time }} ｜ {{ log.detail }}</div>
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
import { reactive, ref, computed } from 'vue'
import { store } from '../state'

    const form = reactive({ student: 'STU-20260105', account: 'campus', amount: 50 })
    const lastTopup = ref(null)

    const policy = [
        { id: 'p1', label: '校园消费账户', limit: '单笔 ¥200 / 日累计 ¥500' },
        { id: 'p2', label: '公交支付账户', limit: '单笔 ¥20 / 日累计 ¥60' },
        { id: 'p3', label: '社会支付账户', limit: '单笔 ¥500 / 日累计 ¥1000' },
    ]

    const logs = [
        { id: 'l1', type: '空中圈存', result: '成功', time: '2026-01-05 09:20:11', detail: '校园账户 +¥50 （MPC写入成功）' },
        { id: 'l2', type: '权限调整', result: '成功', time: '2026-01-04 18:42:03', detail: '公交账户单笔限额改为 ¥20' },
        { id: 'l3', type: '远程冻结', result: '失败', time: '2026-01-04 08:13:29', detail: '指令签名校验不通过，已拒绝' },
    ]

    const alerts = computed(() => store.alerts)
    const pushes = computed(() => store.pushMessages)

    const mapAccount = (id) =>
        id === 'campus' ? '校园消费账户' : id === 'bus' ? '公交支付账户' : '社会支付账户'

    const sendTopup = () => {
        const amount = Math.max(1, form.amount || 0)
        const id = `TP-${Date.now()}`
        lastTopup.value = {
            id,
            student: form.student || 'STU-000000',
            account: form.account,
            amount,
            status: '成功（本地）',
            time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }
        alert('圈存指令已发送（本地回执）')
    }
</script>

<style scoped>
    .page {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .section-header {
        background: #22c55e;
        color: #0b172a;
        padding: 16px;
        border-radius: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.2);
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
        background: rgba(255, 255, 255, 0.9);
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

    input,
    select {
        padding: 10px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
    }

    .primary {
        background: #16a34a;
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
        box-shadow: 0 8px 18px rgba(22, 163, 74, 0.25);
    }

    .hint {
        font-size: 12px;
        color: #475569;
    }

    .voucher {
        border: 1px dashed #16a34a;
        border-radius: 12px;
        padding: 12px;
    }

    .voucher-head {
        font-weight: 700;
        margin-bottom: 8px;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 10px;
        background: #f8fafc;
    }

    .strong {
        font-weight: 700;
    }

    .muted {
        font-size: 13px;
        color: #475569;
    }

    .ghost {
        border: 1px solid #cbd5e1;
        background: transparent;
        padding: 8px 12px;
        border-radius: 10px;
        cursor: pointer;
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
        background: #22c55e;
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
        padding: 4px 8px;
        border-radius: 8px;
    }

    @media (max-width: 768px) {
        .card.wide {
            grid-column: span 1;
        }
    }
</style>
