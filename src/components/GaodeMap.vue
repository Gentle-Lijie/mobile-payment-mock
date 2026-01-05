<template>
    <div class="map" ref="mapEl">
        <div v-if="!gaodeKey" class="placeholder">未配置高德 Key，已跳过地图加载</div>
    </div>
</template>

<script setup>
    import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
    import { gaodeKey, gaodeJsCode, gaodeServiceHost, fenceCoords, fenceCenter } from '../mapConfig'

    const props = defineProps({
        scene: { type: String, default: '' },
        coords: { type: Array, default: () => fenceCoords },
        point: { type: Object, default: () => ({ lng: null, lat: null }) },
    })

    const mapEl = ref(null)
    let map = null
    let polygon = null
    let marker = null

    const injectSecurityConfig = () => {
        window._AMapSecurityConfig = {
            securityJsCode: gaodeJsCode || undefined,
            serviceHost: gaodeServiceHost || undefined,
        }
    }

    const loadScript = () =>
        new Promise((resolve, reject) => {
            if (window.AMap) return resolve()
            injectSecurityConfig()
            const script = document.createElement('script')
            script.src = `https://webapi.amap.com/maps?v=2.0&key=${gaodeKey}`
            script.async = true
            script.onload = () => resolve()
            script.onerror = reject
            document.head.appendChild(script)
        })

    const renderFence = () => {
        if (!map || !props.coords.length) return
        const path = props.coords.map((p) => [p.lng, p.lat])
        if (polygon) {
            polygon.setPath(path)
        } else {
            polygon = new window.AMap.Polygon({
                path,
                strokeColor: '#10b981',
                strokeWeight: 3,
                fillColor: '#10b981',
                fillOpacity: 0.15,
            })
            map.add(polygon)
        }
        map.setFitView([polygon])
    }

    const renderPoint = () => {
        if (!map) return
        if (!props.point || !Number.isFinite(props.point.lng) || !Number.isFinite(props.point.lat)) return
        const position = [props.point.lng, props.point.lat]
        if (!marker) {
            marker = new window.AMap.Marker({ position, label: { content: props.scene || '当前位置' } })
            map.add(marker)
        } else {
            marker.setPosition(position)
            marker.setLabel({ content: props.scene || '当前位置' })
        }
    }

    onMounted(async () => {
        if (!gaodeKey) return
        await loadScript()
        const center = fenceCenter()
        map = new window.AMap.Map(mapEl.value, {
            zoom: 17,
            center: [center.lng, center.lat],
        })
        renderFence()
        renderPoint()
    })

    watch(
        () => props.coords,
        () => renderFence(),
        { deep: true }
    )

    watch(
        () => props.point,
        () => renderPoint(),
        { deep: true }
    )

    onBeforeUnmount(() => {
        map = null
        polygon = null
        marker = null
    })
</script>

<style scoped>
    .map {
        width: 100%;
        height: 220px;
        border-radius: 12px;
        overflow: hidden;
        background: #e2e8f0;
        position: relative;
    }

    .placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #475569;
        font-size: 14px;
        background: #f8fafc;
    }
</style>
