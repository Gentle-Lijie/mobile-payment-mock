<template>
    <section class="page">
        <header class="section-header">
            <div>
                <p class="eyebrow">家长 / 管理端</p>
                <h1>远程圈存 · 消费概览</h1>
                <!-- <p class="subtitle">发起空中圈存，查看支付记录与安全性，数据跨页面同步</p> -->
            </div>
            <div class="pill">实时同步</div>
        </header>

        <div class="layout">
            <div class="left">
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
                        <p class="hint">圈存写入后端，学生端与本页支付记录实时更新。</p>
                    </div>
                    <div v-if="lastTopup" class="voucher">
                        <div class="voucher-head">圈存回执</div>
                        <div class="voucher-body">
                            <div>学生：{{ lastTopup.student }}</div>
                            <div>账户：{{ mapAccount(lastTopup.account) }}</div>
                            <div>金额：¥ {{ lastTopup.amount }}</div>
                            <div>状态：{{ lastTopup.status || '成功' }}</div>
                            <div>时间：{{ lastTopup.time }}</div>
                            <div>回执号：{{ lastTopup.id }}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">消费统计</div>
                    <div class="stat-grid">
                        <div class="stat">
                            <div class="label">总笔数</div>
                            <div class="value">{{ stats.count }}</div>
                        </div>
                        <div class="stat">
                            <div class="label">总金额</div>
                            <div class="value">¥ {{ stats.totalAmount }}</div>
                        </div>
                        <div class="stat warning">
                            <div class="label">疑似风险笔数</div>
                            <div class="value">{{ stats.unsafeCount }}</div>
                        </div>
                        <div class="stat warning">
                            <div class="label">疑似风险金额</div>
                            <div class="value">¥ {{ stats.unsafeAmount }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="right">
                <div class="card table-card">
                    <div class="card-title">支付记录（时间 / 商户 / 安全性）</div>
                    <div class="table-wrapper">
                        <table class="pay-table">
                            <thead>
                                <tr>
                                    <th>支付时间</th>
                                    <th>商户</th>
                                    <th>金额</th>
                                    <th>账户</th>
                                    <th>位置</th>
                                    <th>场景</th>
                                    <th>安全</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in paginatedPayments" :key="item.id">
                                    <td>{{ item.time }}</td>
                                    <td>{{ item.merchant }}</td>
                                    <td>¥ {{ Number(item.amount).toFixed(2) }}</td>
                                    <td>{{ mapAccount(item.account) }}</td>
                                    <td>
                                        <a :href="mapLink(item)" target="_blank" rel="noopener" class="link">
                                            {{ item.lat }}, {{ item.lng }}
                                        </a>
                                    </td>
                                    <td>{{ item.scene }}</td>
                                    <td>
                                        <span :class="['pill', item.safe === false ? 'danger' : 'safe']">
                                            {{ item.safe === false ? '疑似风险' : '安全' }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="table-controls">
                        <div class="page-size">
                            每页
                            <select v-model.number="pageSize">
                                <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
                            </select>
                            条
                        </div>
                        <div class="pager">
                            <button class="ghost" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
                            <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
                            <button class="ghost" :disabled="currentPage === totalPages"
                                @click="currentPage++">下一页</button>
                        </div>
                    </div>
                    <p class="hint">数据来自后端 /state，与控制窗口同步；新增支付/圈存将实时出现在此表。位置点击可跳转高德地图。</p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
    import { reactive, ref, computed, watch } from 'vue'
    import { store, addPayment } from '../state'

    const form = reactive({ student: 'STU-20260105', account: 'campus', amount: 50 })
    const lastTopup = ref(null)

    const payments = computed(() => store.payments)
    const pageSizeOptions = [5, 10, 20, 50]
    const pageSize = ref(10)
    const currentPage = ref(1)

    const sortedPayments = computed(() => payments.value.slice().sort((a, b) => new Date(b.time) - new Date(a.time)))

    const totalPages = computed(() => {
        const size = Math.max(1, Number(pageSize.value) || 1)
        return Math.max(1, Math.ceil(sortedPayments.value.length / size))
    })

    watch([pageSize, sortedPayments], () => {
        currentPage.value = 1
    })

    watch(totalPages, (val) => {
        if (currentPage.value > val) currentPage.value = val
    })

    const paginatedPayments = computed(() => {
        const size = Math.max(1, Number(pageSize.value) || 1)
        const start = (currentPage.value - 1) * size
        return sortedPayments.value.slice(start, start + size)
    })

    const stats = computed(() => {
        const totalAmount = payments.value.reduce((s, p) => s + Number(p.amount || 0), 0)
        const unsafeAmount = payments.value.filter((p) => p.safe === false).reduce((s, p) => s + Number(p.amount || 0), 0)
        const unsafeCount = payments.value.filter((p) => p.safe === false).length
        return {
            totalAmount: totalAmount.toFixed(2),
            unsafeAmount: unsafeAmount.toFixed(2),
            unsafeCount,
            count: payments.value.length,
        }
    })

    const mapAccount = (id) => (id === 'campus' ? '校园消费账户' : id === 'bus' ? '公交支付账户' : '社会支付账户')
    const mapLink = (item) => `https://uri.amap.com/marker?position=${item.lng},${item.lat}&name=${encodeURIComponent(item.merchant || '位置')}`

    const sendTopup = async () => {
        const amount = Math.max(1, form.amount || 0)
    const data = await addPayment({
        type: 'topup',
        amount,
        account: form.account,
        merchant: `圈存-${form.student || 'STU-000000'}`,
        safe: true,
        scene: '家长远程',
    })
    lastTopup.value = data || {
        id: `TP-${Date.now()}`,
        student: form.student || 'STU-000000',
        account: form.account,
        amount,
        status: '成功（本地）',
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }
    alert('圈存指令已发送并同步')
}
</script>

<style scoped>
    .page {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100vh;
        overflow: hidden;
        padding: 16px;
        box-sizing: border-box;
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

    .layout {
        display: grid;
        grid-template-columns: 3fr 7fr;
        gap: 16px;
        flex: 1;
        min-height: 0;
    }

    .left,
    .right {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 0;
    }

    .card {
        background: #fff;
        border-radius: 14px;
        padding: 16px;
        width: 100%;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .table-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .card-title {
        font-weight: 700;
        font-size: 16px;
    }

    .table-controls {
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }

    .page-size select {
        margin: 0 6px;
        padding: 4px 8px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #fff;
    }

    .pager {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 10px;
    }

    .stat {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px;
        background: #f8fafc;
    }

    .stat.warning {
        border-color: #f97316;
        background: #fff7ed;
    }

    .stat .label {
        font-size: 13px;
        color: #475569;
    }

    .stat .value {
        font-weight: 700;
        font-size: 20px;
        margin-top: 6px;
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

    .table-wrapper {
        overflow: auto;
        flex: 1;
        min-height: 0;
        max-height: calc(100vh - 220px);
    }

    .pay-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

    .pay-table th,
    .pay-table td {
        padding: 10px;
        border-bottom: 1px solid #e2e8f0;
        text-align: left;
        white-space: nowrap;
    }

    .pay-table th {
        background: #f8fafc;
        font-weight: 700;
    }

    .pay-table tr:hover {
        background: #f1f5f9;
    }

    .pill.safe {
        background: #ecfdf3;
        color: #16a34a;
        border-radius: 999px;
        padding: 4px 10px;
        font-weight: 600;
    }

    .pill.danger {
        background: #fff7ed;
        color: #f97316;
        border-radius: 999px;
        padding: 4px 10px;
        font-weight: 600;
    }

    .link {
        color: #0ea5e9;
        text-decoration: underline;
    }

    @media (max-width: 768px) {
        .layout {
            grid-template-columns: 1fr;
        }

        .table-wrapper {
            max-height: 50vh;
        }
    }
</style>
