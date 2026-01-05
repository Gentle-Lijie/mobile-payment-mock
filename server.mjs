import { createServer } from 'http'
import { randomUUID } from 'crypto'

const PORT = process.env.PORT || 8788
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

const state = {
  scenes: [
    { id: 'campus', name: '校园围栏内', desc: '进入校内围栏，激活校园消费账户', lat: '30.2742', lng: '120.1551', nfc: false },
    { id: 'bus', name: '公交NFC检测', desc: '检测到公交NFC信号，激活公交支付账户', lat: '30.2768', lng: '120.1605', nfc: true },
    { id: 'social', name: '社会场景', desc: '未检测校园/公交信号，使用社会支付账户', lat: '30.2801', lng: '120.1658', nfc: false },
  ],
  currentScene: 'campus',
  pushMessages: [],
  alerts: [],
    payments: defaultPayments(),
}

const clients = new Set()

const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19)

function sendJson(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(data))
}

function broadcast(type, data) {
  const payload = `data: ${JSON.stringify({ type, data })}\n\n`
  for (const res of clients) {
    res.write(payload)
  }
}

function handleOptions(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end()
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1e6) req.connection.destroy()
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (e) {
        reject(e)
      }
    })
  })
}

async function handleRequest(req, res) {
  const { method, url } = req

  if (method === 'OPTIONS') return handleOptions(res)

  if (method === 'GET' && url === '/state') {
    return sendJson(res, 200, state)
  }

  if (method === 'GET' && url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })
    res.write(`data: ${JSON.stringify({ type: 'ready', data: 'ok' })}\n\n`)
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }

  if (method === 'POST' && url === '/scene') {
    try {
      const body = await parseBody(req)
      if (!body.id) return sendJson(res, 400, { error: 'id required' })
      state.currentScene = body.id
      broadcast('scene', body.id)
      return sendJson(res, 200, { ok: true })
    } catch (e) {
      return sendJson(res, 400, { error: 'invalid json' })
    }
  }

  if (method === 'POST' && url === '/push') {
    try {
      const body = await parseBody(req)
      const msg = {
        id: randomUUID(),
        level: body.level || 'info',
        title: body.title || '行为推送',
        detail: body.detail || '未填写详情',
        time: timestamp(),
      }
      state.pushMessages.unshift(msg)
      state.pushMessages = state.pushMessages.slice(0, 50)
      broadcast('push', msg)
      if (msg.level === 'high' || msg.level === 'critical') {
        const alert = {
          id: randomUUID(),
          level: msg.level === 'critical' ? 'high' : msg.level,
          title: `同步告警：${msg.title}`,
          time: msg.time,
          lat: '30.2700',
          lng: '120.1600',
          reason: msg.detail,
        }
        state.alerts.unshift(alert)
        state.alerts = state.alerts.slice(0, 50)
        broadcast('alert', alert)
      }
      return sendJson(res, 200, { ok: true })
    } catch (e) {
      return sendJson(res, 400, { error: 'invalid json' })
    }
  }

  if (method === 'POST' && url === '/alert') {
    try {
      const body = await parseBody(req)
      const alert = {
        id: randomUUID(),
        level: body.level || 'medium',
        title: body.title || '新增预警',
        time: timestamp(),
        lat: '30.2700',
        lng: '120.1600',
        reason: body.reason || '未提供依据',
      }
      state.alerts.unshift(alert)
      state.alerts = state.alerts.slice(0, 50)
      broadcast('alert', alert)
      return sendJson(res, 200, { ok: true })
    } catch (e) {
      return sendJson(res, 400, { error: 'invalid json' })
    }
  }

    if (method === 'POST' && url === '/pay') {
        try {
            const body = await parseBody(req)
            const payment = {
                id: randomUUID(),
                type: 'pay',
                amount: Number(body.amount) || 0,
                account: body.account || 'campus',
                merchant: body.merchant || '未知商户',
                time: body.time || timestamp(),
                lat: body.lat || '30.2742',
                lng: body.lng || '120.1551',
                scene: body.scene || '校园围栏内',
                safe: body.safe !== false,
            }
            state.payments.unshift(payment)
            state.payments = state.payments.slice(0, 100)
            broadcast('payment', payment)
            return sendJson(res, 200, { ok: true, data: payment })
        } catch (e) {
            return sendJson(res, 400, { error: 'invalid json' })
        }
    }

    if (method === 'POST' && url === '/topup') {
        try {
            const body = await parseBody(req)
            const payment = {
                id: randomUUID(),
                type: 'topup',
                amount: Number(body.amount) || 0,
                account: body.account || 'campus',
                merchant: body.merchant || '远程圈存',
                time: body.time || timestamp(),
                lat: body.lat || '30.2742',
                lng: body.lng || '120.1551',
                scene: body.scene || '家长远程',
                safe: true,
            }
            state.payments.unshift(payment)
            state.payments = state.payments.slice(0, 100)
            broadcast('payment', payment)
            return sendJson(res, 200, { ok: true, data: payment })
        } catch (e) {
            return sendJson(res, 400, { error: 'invalid json' })
        }
    }

  sendJson(res, 404, { error: 'not found' })
}

createServer(handleRequest).listen(PORT, () => {
  console.log(`[server] listening on ${PORT}`)
})
