<template>
    <section class="page">
        <!-- <header class="section-header">
            <div>
                <p class="eyebrow">家长 / 管理端</p>
                <h1>消费记录</h1>
                <p class="subtitle">查看支付时间、商户、位置与安全性（时间降序）</p>
            </div>
            <div class="pill">实时同步</div>
        </header> -->

        <div class="card table-card">
            <div class="card-title">支付记录</div>
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
                    <button class="ghost" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
                </div>
            </div>
            <p class="hint">数据来自 /state，新增支付/圈存实时推送；默认数据按时间降序。</p>
        </div>
    </section>
</template>

<script setup>
    import { computed, ref, watch } from 'vue'
    import { store } from '../state'

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

    const mapAccount = (id) => (id === 'campus' ? '校园消费账户' : id === 'bus' ? '公交支付账户' : '社会支付账户')
    const mapLink = (item) => `https://uri.amap.com/marker?position=${item.lng},${item.lat}&name=${encodeURIComponent(item.merchant || '位置')}`
</script>

<style scoped>
    .page {
        display: flex;
        flex-direction: column;
        gap: 16px;
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
        gap: 16px;
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

    .pill {
        background: rgba(255, 255, 255, 0.9);
        padding: 10px 14px;
        border-radius: 12px;
        font-weight: 600;
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

    .table-card {
        min-height: 0;
    }

    .card-title {
        font-weight: 700;
        font-size: 16px;
    }

    .table-wrapper {
        overflow: auto;
        max-height: calc(100vh - 200px);
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

    .ghost {
        border: 1px solid #cbd5e1;
        background: transparent;
        padding: 8px 12px;
        border-radius: 10px;
        cursor: pointer;
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

    .hint {
        font-size: 12px;
        color: #475569;
    }

    .link {
        color: #0ea5e9;
        text-decoration: underline;
    }

    @media (max-width: 768px) {
        .table-wrapper {
            max-height: 60vh;
        }
    }
</style>
