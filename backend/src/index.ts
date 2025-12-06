import express from 'express'
import http from 'http'
import WebSocket from 'ws'

const app = express()
app.use(express.json())

// Simple in-memory store for fixture state (replace with persistent DB later)
let fixtureState: any = { groups: [] }

app.get('/api/fixture', (req, res) => {
  res.json(fixtureState)
})

app.post('/api/admin/fixture', (req, res) => {
  fixtureState = req.body
  // broadcast to websocket clients
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'fixture:update', payload: fixtureState }))
    }
  })
  res.json({ ok: true })
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws) => {
  console.log('ws connected')
  ws.send(JSON.stringify({ type: 'hello', payload: 'connected' }))
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`Server listening ${PORT}`))
