import { reactive } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8788'
const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19)

const defaultPayments = () => {
  const base = [
    ['2026-01-01 08:05:11', '校园食堂', 18.5, 'campus', '30.2742', '120.1551', true, '校园围栏内'],
    ['2026-01-01 09:12:20', '公交NFC扣费', 2.0, 'bus', '30.2768', '120.1605', true, '公交NFC检测'],
    ['2026-01-01 10:28:45', '便利店-北门', 12.3, 'campus', '30.2749', '120.1560', true, '校园围栏内'],
    ['2026-01-01 12:15:32', '午餐-二食堂', 19.8, 'campus', '30.2741', '120.1553', true, '校园围栏内'],
    ['2026-01-01 14:42:10', '奶茶店-学活', 15.0, 'campus', '30.2747', '120.1557', true, '校园围栏内'],
    ['2026-01-01 17:20:55', '外卖-到寝', 26.0, 'social', '30.2781', '120.1662', true, '社会场景'],
    ['2026-01-01 19:35:40', '商场服饰', 188.0, 'social', '30.2850', '120.1711', false, '社会场景'],
    ['2026-01-01 21:10:05', '夜宵-便利店', 11.0, 'campus', '30.2744', '120.1555', true, '校园围栏内'],
    ['2026-01-02 08:08:22', '公交NFC扣费', 2.0, 'bus', '30.2775', '120.1598', true, '公交NFC检测'],
    ['2026-01-02 09:45:11', '咖啡馆-教研楼', 22.0, 'campus', '30.2738', '120.1544', true, '校园围栏内'],
    ['2026-01-02 11:05:39', '午餐-二食堂', 18.6, 'campus', '30.2741', '120.1553', true, '校园围栏内'],
    ['2026-01-02 12:40:02', '共享单车', 1.5, 'social', '30.2779', '120.1638', true, '社会场景'],
    ['2026-01-02 15:18:44', '图书馆打印', 6.5, 'campus', '30.2758', '120.1565', true, '校园围栏内'],
    ['2026-01-02 18:02:19', '外卖-校外', 42.0, 'social', '30.2830', '120.1690', false, '社会场景'],
    ['2026-01-02 20:26:51', '网购数码', 299.0, 'social', '30.2845', '120.1705', false, '社会场景'],
    ['2026-01-02 21:58:33', '公交NFC扣费', 2.2, 'bus', '30.2771', '120.1601', true, '公交NFC检测'],
    ['2026-01-03 07:55:18', '早餐-包子铺', 12.0, 'campus', '30.2743', '120.1552', true, '校园围栏内'],
    ['2026-01-03 09:22:40', '公交NFC扣费', 2.0, 'bus', '30.2766', '120.1602', true, '公交NFC检测'],
    ['2026-01-03 11:33:09', '校超-水果', 9.8, 'campus', '30.2755', '120.1568', true, '校园围栏内'],
    ['2026-01-03 13:05:27', '地铁扫码', 4.0, 'social', '30.2811', '120.1673', true, '社会场景'],
    ['2026-01-03 15:47:42', '实验材料', 35.0, 'campus', '30.2735', '120.1541', true, '校园围栏内'],
    ['2026-01-03 18:18:30', '烧烤摊', 56.0, 'social', '30.2835', '120.1695', false, '社会场景'],
    ['2026-01-03 20:40:15', '奶茶-商圈', 17.0, 'social', '30.2840', '120.1701', false, '社会场景'],
    ['2026-01-03 22:05:48', '打印店', 7.0, 'campus', '30.2758', '120.1565', true, '校园围栏内'],
    ['2026-01-04 08:12:05', '公交NFC扣费', 2.0, 'bus', '30.2769', '120.1606', true, '公交NFC检测'],
    ['2026-01-04 09:58:33', '教研楼咖啡', 21.0, 'campus', '30.2738', '120.1544', true, '校园围栏内'],
    ['2026-01-04 12:22:14', '午餐-一食堂', 20.5, 'campus', '30.2740', '120.1550', true, '校园围栏内'],
    ['2026-01-04 14:36:39', '外卖-校门口', 24.0, 'social', '30.2792', '120.1651', true, '社会场景'],
    ['2026-01-04 17:10:21', '商场服饰', 169.0, 'social', '30.2850', '120.1711', false, '社会场景'],
    ['2026-01-04 19:45:57', '公交NFC扣费', 2.0, 'bus', '30.2774', '120.1609', true, '公交NFC检测'],
    ['2026-01-04 21:30:10', '奶茶-夜场', 18.0, 'social', '30.2860', '120.1720', false, '社会场景'],
  ]
  base.sort((a, b) => new Date(b[0]) - new Date(a[0]))
  return base.map((item, idx) => ({
        id: `PM-${idx + 1}`,
        time: item[0],
        merchant: item[1],
        amount: item[2],
        account: item[3],
        lat: item[4],
        lng: item[5],
        safe: item[6],
        scene: item[7],
        type: 'pay',
    }))
}

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
    payments: defaultPayments(),
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
      if (Array.isArray(data.payments)) store.payments = data.payments
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
        if (payload.type === 'payment') {
            store.payments = [payload.data, ...store.payments].slice(0, 100)
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

export async function addPayment({ type = 'pay', amount, account, merchant, safe = true, scene, lat, lng }) {
    const payload = {
        type,
        amount,
        account,
        merchant,
        safe,
        scene,
        lat,
        lng,
    }
    const url = type === 'topup' ? '/topup' : '/pay'
    try {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({}))
        if (data?.data) return data.data
    } catch (e) {
        console.warn('[sync] addPayment failed', e)
    }
    return null
}
