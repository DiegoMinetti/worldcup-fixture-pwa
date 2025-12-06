import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import winston from 'winston'
import os from 'os'

const app = express()
app.use(express.json())

// CORS: allow credentials so cookies can be used from the frontend
app.use(cors({ origin: true, credentials: true }))
app.use(cookieParser())

// Logger (console + file)
const logDir = path.join(__dirname, '..', '..', 'logs')
try { fs.mkdirSync(logDir, { recursive: true }) } catch {}
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'wc-fixture' },
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: path.join(logDir, 'app.log') })
  ]
})

// Admin auth setup
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || (Math.random().toString(36) + Date.now())

// Login attempt tracking: basic in-memory throttling
const loginAttempts = new Map() // key -> { count, firstAt, lockedUntil }
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes window
const LOCK_MS = 15 * 60 * 1000 // lock for 15 minutes

function attemptKey(req: any) {
  // use IP + maybe username later
  return req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown'
}

function recordFailedAttempt(req: any) {
  const key = attemptKey(req)
  const now = Date.now()
  const st = loginAttempts.get(key) || { count: 0, firstAt: now, lockedUntil: 0 }
  if (now - st.firstAt > WINDOW_MS) {
    st.count = 1
    st.firstAt = now
  } else {
    st.count += 1
  }
  if (st.count >= MAX_ATTEMPTS) {
    st.lockedUntil = now + LOCK_MS
  }
  loginAttempts.set(key, st)
  return st
}

function isLocked(req: any) {
  const key = attemptKey(req)
  const st = loginAttempts.get(key)
  if (!st) return false
  if (st.lockedUntil && Date.now() < st.lockedUntil) return true
  return false
}

function resetAttempts(req: any) {
  const key = attemptKey(req)
  loginAttempts.delete(key)
}

  if (!ADMIN_PASSWORD_HASH) {
  if (ADMIN_PASSWORD) {
    // create a hash for runtime if only plain password provided (not ideal for production)
    logger.warn('ADMIN_PASSWORD provided; generating hash at startup. For production use ADMIN_PASSWORD_HASH env var.')
    ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10)
  } else {
    // fallback to default weak password (development only)
    logger.warn('No admin password provided. Using default password "admin123" (development only).')
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
  try {
    if (isLocked(req)) return res.status(429).json({ error: 'too many attempts, try later' })
    const { password } = req.body || {}
    if (!password) return res.status(400).json({ error: 'missing password' })
    const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    const ip = attemptKey(req)
    if (!ok) {
      const st = recordFailedAttempt(req)
      logger.warn('Failed admin login attempt', { ip, attempts: st.count })
      return res.status(401).json({ error: 'invalid credentials' })
    }
    // success
    resetAttempts(req)
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' })
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('session', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 8 * 3600 * 1000 })
    logger.info('Admin login success', { ip })
    res.json({ ok: true })
  } catch (err) {
    logger.error('Error in admin login', { err: err?.message || err })
    res.status(500).json({ error: 'internal' })
  }
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
