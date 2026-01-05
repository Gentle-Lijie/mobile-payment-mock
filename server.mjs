import { createServer } from 'http'
import { randomUUID } from 'crypto'

const PORT = process.env.PORT || 8788
const state = {
  scenes: [
    { id: 'campus', name: '校园围栏内', desc: '进入校内围栏，激活校园消费账户', lat: '30.2742', lng: '120.1551', nfc: false },
    { id: 'bus', name: '公交NFC检测', desc: '检测到公交NFC信号，激活公交支付账户', lat: '30.2768', lng: '120.1605', nfc: true },
    { id: 'social', name: '社会场景', desc: '未检测校园/公交信号，使用社会支付账户', lat: '30.2801', lng: '120.1658', nfc: false },
  ],
  currentScene: 'campus',
  pushMessages: [],
  alerts: [],
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

  sendJson(res, 404, { error: 'not found' })
}

createServer(handleRequest).listen(PORT, () => {
  console.log(`[server] listening on ${PORT}`)
})
