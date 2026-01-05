<template>
    <div id="app">
        <header class="topbar">
            <div class="brand">移动支付钱包</div>
            <nav class="nav">
                <RouterLink to="/student" class="link" active-class="active">学生端</RouterLink>
                <RouterLink to="/parent" class="link" active-class="active">家长/管理端</RouterLink>
                <RouterLink to="/parent-records" class="link" active-class="active">家长消费记录</RouterLink>
            </nav>
        </header>
        <main class="content">
            <router-view />
        </main>

        <button class="floating" @click="openControlWindow">状态控制窗口</button>
    </div>
</template>

<script setup>
    import { RouterLink, useRoute } from 'vue-router'
    import { onMounted, computed } from 'vue'
    import { initSync } from './state'

    const route = useRoute()
    const showNav = computed(() => !route.meta.hideNav)

    const openControlWindow = () => {
        const url = `${window.location.origin}/control`
        window.open(url, 'control-panel', 'width=1180,height=900,noopener')
    }

    onMounted(() => {
        initSync()
    })
</script>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: #f5f5f5;
        color: #1f2937;
    }

    #app {
        min-height: 100vh;
    }

    .topbar {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #0f172a;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .brand {
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    .nav {
        display: flex;
        gap: 12px;
    }

    .link {
        color: #cbd5e1;
        text-decoration: none;
        padding: 6px 12px;
        border-radius: 8px;
        transition: background 0.2s ease, color 0.2s ease;
    }

    .link:hover {
        background: rgba(148, 163, 184, 0.2);
        color: #fff;
    }

    .link.active {
        background: #10b981;
        color: #0b172a;
        font-weight: 600;
    }

    .content {
        padding: 20px;
    }

    .floating {
        position: fixed;
        right: 20px;
        bottom: 20px;
        padding: 12px 16px;
        border: none;
        border-radius: 12px;
        background: #10b981;
        color: #0b172a;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(16, 185, 129, 0.35);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        z-index: 15;
    }

    .floating:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px rgba(16, 185, 129, 0.45);
    }
</style>
