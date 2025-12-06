import React, { useEffect, useState } from 'react'
import { Container, Typography, Button, TextField, Stack } from '@mui/material'
import { sampleGroups } from './data/groups'

type Fixture = { groups: any[] }

export default function App() {
  const [realFixture, setRealFixture] = useState<Fixture | null>(null)
  const [simulation, setSimulation] = useState<Fixture | null>(null)
  const [isAdminVisible, setIsAdminVisible] = useState(false)
  const [adminJson, setAdminJson] = useState('')

  useEffect(() => {
    // load persisted simulation from localStorage
    const sim = localStorage.getItem('wc-simulation')
    if (sim) {
      try {
        setSimulation(JSON.parse(sim))
      } catch {}
    }

    // open websocket to backend for real fixture updates
    try {
      const host = location.hostname
      const ws = new WebSocket(`ws://${host}:4000`)
      ws.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'fixture:update') {
            setRealFixture(msg.payload)
          }
        } catch {}
      })
    } catch (e) {
      // ignore websocket errors for now
    }
  }, [])

  useEffect(() => {
    // fetch current fixture from backend on load
    fetch('/api/fixture')
      .then(r => r.json())
      .then(d => setRealFixture(d))
      .catch(() => {})
  }, [])

  function saveSimulation() {
    if (simulation) {
      localStorage.setItem('wc-simulation', JSON.stringify(simulation))
      alert('Simulación guardada localmente')
    }
  }

  function randomizeSimulation() {
    const sim = { groups: sampleGroups.map(g => ({ ...g, teams: shuffleArray(g.teams) })) }
    setSimulation(sim)
  }

  function shuffleArray(arr: any[]) {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  async function postAdminFixture() {
    try {
      const payload = JSON.parse(adminJson)
      const res = await fetch('/api/admin/fixture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) alert('Fixture publicado')
    } catch (e) {
      alert('JSON inválido')
    }
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Worldcup Fixture PWA
      </Typography>

      <Stack direction="row" spacing={2} style={{marginBottom:16}}>
        <Button variant="contained" onClick={() => setIsAdminVisible(v => !v)}>
          {isAdminVisible ? 'Ocultar Admin' : 'Mostrar Admin'}
        </Button>
        <Button variant="outlined" onClick={randomizeSimulation}>Randomizar Simulación</Button>
        <Button variant="contained" onClick={saveSimulation}>Guardar Simulación (local)</Button>
      </Stack>

      {isAdminVisible && (
        <div style={{marginBottom:24}}>
          <Typography variant="h6">Panel Admin (publicar fixture)</Typography>
          <TextField
            multiline
            minRows={6}
            fullWidth
            value={adminJson}
            onChange={e => setAdminJson(e.target.value)}
            placeholder='Pegar JSON del fixture aquí (ej: {"groups":[...]})'
          />
          <Button variant="contained" onClick={postAdminFixture} style={{marginTop:8}}>Publicar</Button>
        </div>
      )}

      <div style={{display:'flex', gap:32}}>
        <div style={{flex:1}}>
          <Typography variant="h6">Fixture Real</Typography>
          {realFixture?.groups?.map((g:any) => (
            <div key={g.name} style={{marginBottom:12}}>
              <Typography variant="subtitle1">Grupo {g.name}</Typography>
              <div style={{display:'flex',gap:12}}>
                {g.teams.map((t:any) => (
                  <div key={t.code} style={{padding:8, border:'1px solid #eee'}}>
                    <Typography>{t.name}</Typography>
                    <Typography variant="caption">{t.code}</Typography>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{flex:1}}>
          <Typography variant="h6">Simulación Local</Typography>
          {(simulation ?? { groups: sampleGroups }).groups.map((g:any) => (
            <div key={g.name} style={{marginBottom:12}}>
              <Typography variant="subtitle1">Grupo {g.name}</Typography>
              <div style={{display:'flex',gap:12}}>
                {g.teams.map((t:any) => (
                  <div key={t.code} style={{padding:8, border:'1px solid #eee'}}>
                    <Typography>{t.name}</Typography>
                    <Typography variant="caption">{t.code}</Typography>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}
