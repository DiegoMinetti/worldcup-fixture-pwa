import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

const app = express()
app.use(cors())
app.use(express.json())

// Simple in-memory store for fixture state (replace with persistent DB later)
let fixtureState: any = { groups: [] }

app.get('/api/fixture', (req, res) => {
  res.json(fixtureState)
})

app.post('/api/admin/fixture', (req, res) => {
  // require admin token in header 'x-admin-token'
  const token = req.header('x-admin-token')
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123'
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  fixtureState = req.body
  // broadcast to websocket clients
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'fixture:update', payload: fixtureState }))
    }
  })
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
