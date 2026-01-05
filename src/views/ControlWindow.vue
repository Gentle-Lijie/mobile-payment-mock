<template>
    <div class="page">
        <header class="section-header">
            <div>
                <p class="eyebrow">独立窗口 · 状态控制</p>
                <h1>场景切换 · 行为推送 · 告警同步</h1>
                <p class="subtitle">窗口独立于主界面，可实时调整状态、发送多级别推送并同步告警</p>
            </div>
            <button class="ghost" @click="window.close()">关闭窗口</button>
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

            <div class="card wide">
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

            <div class="card">
                <div class="card-title">预警列表</div>
                <ul class="alerts">
                    <li v-for="alert in store.alerts" :key="alert.id" :class="alert.level">
                        <div class="alert-head">
                            <span class="badge">{{ alert.level.toUpperCase() }}</span>
                            <span>{{ alert.title }}</span>
                        </div>
                        <div class="alert-meta">时间：{{ alert.time }} ｜ 位置：{{ alert.lat }}, {{ alert.lng }}</div>
                        <div class="alert-meta">依据：{{ alert.reason }}</div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { reactive } from 'vue'
    import { store, addPush, addAlert, setScene } from '../state'

    const push = reactive({ level: 'info', title: '', detail: '' })
    const alert = reactive({ title: '', reason: '', level: 'medium' })

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
</script>

<style scoped>
    .page {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        background: #f4f6fb;
        min-height: 100vh;
    }

    .section-header {
        background: #0f172a;
        color: #e2e8f0;
        padding: 16px;
        border-radius: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
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

    .ghost {
        border: 1px solid #cbd5e1;
        background: transparent;
        color: #e2e8f0;
        padding: 10px 14px;
        border-radius: 10px;
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
        background: #fff;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .card.wide {
        grid-column: span 2;
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

    input,
    select,
    textarea {
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
        color: #0f172a;
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
