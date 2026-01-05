import { reactive } from 'vue'

const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19)

export const store = reactive({
  scenes: [
    { id: 'campus', name: '校园围栏内', desc: '进入校内围栏，激活校园消费账户', lat: '30.2742', lng: '120.1551', nfc: false },
    { id: 'bus', name: '公交NFC检测', desc: '检测到公交NFC信号，激活公交支付账户', lat: '30.2768', lng: '120.1605', nfc: true },
    { id: 'social', name: '社会场景', desc: '未检测校园/公交信号，使用社会支付账户', lat: '30.2801', lng: '120.1658', nfc: false },
  ],
  currentScene: 'campus',
  pushMessages: [
    { id: 'p-init', level: 'info', title: '系统就绪', detail: '状态控制窗口可用于切换场景与推送告警', time: timestamp() },
  ],
  alerts: [
    {
      id: 'a1',
      level: 'high',
      title: '一级预警：疑似盗刷风险',
      time: '2026-01-05 09:25:14',
      lat: '30.3200',
      lng: '120.1900',
      reason: '10分钟内跨越15公里异地消费，轨迹偏离预设路线',
    },
    {
      id: 'a2',
      level: 'medium',
      title: '二级预警：异常频次',
      time: '2026-01-05 08:58:02',
      lat: '30.2768',
      lng: '120.1605',
      reason: '30分钟内连续4笔小额支付，触发频次阈值',
    },
  ],
})

export function addPush({ level = 'info', title, detail }) {
  const msg = {
    id: `p-${Date.now()}`,
    level,
    title: title || '行为推送',
    detail: detail || '未填写详情',
    time: timestamp(),
  }
  store.pushMessages = [msg, ...store.pushMessages].slice(0, 12)
  if (level === 'high' || level === 'critical') {
    addAlert({
      level: level === 'critical' ? 'high' : level,
      title: `同步告警：${msg.title}`,
      reason: msg.detail,
    })
  }
}

export function addAlert({ level = 'medium', title, reason }) {
  const alert = {
    id: `a-${Date.now()}`,
    level,
    title: title || '新增预警',
    time: timestamp(),
    lat: '30.2700',
    lng: '120.1600',
    reason: reason || '未提供依据',
  }
  store.alerts = [alert, ...store.alerts].slice(0, 12)
}
