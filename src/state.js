import { reactive } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8788'
const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19)

const defaultPushes = () => [
  { id: 'p-init', level: 'info', title: '系统就绪', detail: '状态控制窗口可用于切换场景与推送告警', time: timestamp() },
  { id: 'p-geo', level: 'info', title: '位置签到完成', detail: '已在校园围栏内完成签到，继续保持在线即可获得福利', time: timestamp() },
  { id: 'p-limit', level: 'medium', title: '公交小额免密提醒', detail: '公交账户今日累计 12.5 元，仍在阈值内', time: timestamp() },
  { id: 'p-risk', level: 'high', title: '异地支付尝试', detail: '检测到 15km 外的扫码尝试，已自动切换为社会支付账户', time: timestamp() },
]

const defaultAlerts = () => [
  {
    id: 'a-geo',
    level: 'medium',
    title: '围栏外支付拦截',
    time: timestamp(),
    lat: '30.2705',
    lng: '120.1612',
    reason: '尝试在围栏外使用校园账户支付，已阻断并提示改用社会支付账户',
  },
  {
    id: 'a-nfc',
    level: 'high',
    title: '公交NFC信号丢失',
    time: timestamp(),
    lat: '30.2768',
    lng: '120.1605',
    reason: '公交线路信号中断，已暂缓扣款并保留交易凭证',
  },
]
let initialized = false
let evtSource = null

export const store = reactive({
  scenes: [
    { id: 'campus', name: '校园围栏内', desc: '进入校内围栏，激活校园消费账户', lat: '30.2742', lng: '120.1551', nfc: false },
    { id: 'bus', name: '公交NFC检测', desc: '检测到公交NFC信号，激活公交支付账户', lat: '30.2768', lng: '120.1605', nfc: true },
    { id: 'social', name: '社会场景', desc: '未检测校园/公交信号，使用社会支付账户', lat: '30.2801', lng: '120.1658', nfc: false },
  ],
  currentScene: 'campus',
  pushMessages: defaultPushes(),
  alerts: defaultAlerts(),
})

async function fetchState() {
  try {
    const res = await fetch(`${API_BASE}/state`)
    if (!res.ok) throw new Error('state fetch failed')
    const data = await res.json()
    if (data.scenes) store.scenes = data.scenes
    if (data.currentScene) store.currentScene = data.currentScene
    if (Array.isArray(data.pushMessages)) store.pushMessages = data.pushMessages
    if (Array.isArray(data.alerts)) store.alerts = data.alerts
  } catch (e) {
    console.warn('[sync] fetch state failed, using defaults', e)
  }
}

function connectEvents() {
  if (evtSource) return
  evtSource = new EventSource(`${API_BASE}/events`)
  evtSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data)
      if (payload.type === 'scene') {
        store.currentScene = payload.data
      }
      if (payload.type === 'push') {
        store.pushMessages = [payload.data, ...store.pushMessages].slice(0, 50)
      }
      if (payload.type === 'alert') {
        store.alerts = [payload.data, ...store.alerts].slice(0, 50)
      }
    } catch (e) {
      console.warn('[sync] parse event failed', e)
    }
  }
  evtSource.onerror = () => {
    console.warn('[sync] event source error, retrying in 2s')
    evtSource?.close()
    evtSource = null
    setTimeout(connectEvents, 2000)
  }
}

export async function initSync() {
  if (initialized) return
  initialized = true
  await fetchState()
  connectEvents()
}

export async function setScene(id) {
  store.currentScene = id
  try {
    await fetch(`${API_BASE}/scene`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  } catch (e) {
    console.warn('[sync] setScene failed', e)
  }
}

export async function addPush({ level = 'info', title, detail }) {
  const payload = {
    level,
    title: title || '行为推送',
    detail: detail || '未填写详情',
  }
  try {
    await fetch(`${API_BASE}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.warn('[sync] addPush failed', e)
  }
}

export async function addAlert({ level = 'medium', title, reason }) {
  const payload = {
    level,
    title: title || '新增预警',
    reason: reason || '未提供依据',
  }
  try {
    await fetch(`${API_BASE}/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.warn('[sync] addAlert failed', e)
  }
}
