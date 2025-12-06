import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express()
app.use(express.json())

// CORS: allow credentials so cookies can be used from the frontend
app.use(cors({ origin: true, credentials: true }))
app.use(cookieParser())

// Admin auth setup
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || (Math.random().toString(36) + Date.now())

if (!ADMIN_PASSWORD_HASH) {
  if (ADMIN_PASSWORD) {
    // create a hash for runtime if only plain password provided (not ideal for production)
    console.warn('ADMIN_PASSWORD provided; generating hash at startup. For production use ADMIN_PASSWORD_HASH env var.')
    ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10)
  } else {
    // fallback to default weak password (development only)
    console.warn('No admin password provided. Using default password "admin123" (development only).')
    ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10)
  }
}

// Simple in-memory store for fixture state (replace with persistent DB later)
let fixtureState: any = { groups: [] }

app.get('/api/fixture', (req, res) => {
  res.json(fixtureState)
})

// Helper: verify JWT from cookie or Authorization header
function requireAdmin(req: any, res: any, next: any) {
  const token = req.cookies?.session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null)
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    // attach to req if needed
    req.admin = decoded
    return next()
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' })
  }
}

app.post('/api/admin/fixture', requireAdmin, (req, res) => {
  fixtureState = req.body
  // broadcast to websocket clients
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'fixture:update', payload: fixtureState }))
    }
  })
  res.json({ ok: true })
})

// Admin login endpoint: POST { password }
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body || {}
  if (!password) return res.status(400).json({ error: 'missing password' })
  const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  if (!ok) return res.status(401).json({ error: 'invalid credentials' })

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' })
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('session', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 8 * 3600 * 1000 })
  res.json({ ok: true })
})

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('session')
  res.json({ ok: true })
})

// Serve frontend static files when available (production)
const frontDist = path.join(__dirname, '..', 'public')
if (fs.existsSync(frontDist)) {
  app.use(express.static(frontDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontDist, 'index.html'))
  })
}

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws) => {
  console.log('ws connected')
  ws.send(JSON.stringify({ type: 'hello', payload: 'connected' }))
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`Server listening ${PORT}`))
