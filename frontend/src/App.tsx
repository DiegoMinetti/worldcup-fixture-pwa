import React, { useEffect, useState } from 'react'
import { Container, Typography, Button } from '@mui/material'
import { sampleGroups } from './data/groups'

export default function App() {
  const [groups] = useState(sampleGroups)

  useEffect(() => {
    // placeholder: register service worker when ready
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(() => {
        // noop for now
      })
    }
  }, [])

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Worldcup Fixture PWA
      </Typography>
      {groups.map((g) => (
        <div key={g.name} style={{marginBottom:16}}>
          <Typography variant="h6">Grupo {g.name}</Typography>
          <div style={{display:'flex',gap:12}}>
            {g.teams.map(t => (
              <div key={t.code} style={{padding:8, border:'1px solid #eee'}}>
                <Typography>{t.name}</Typography>
                <Typography variant="caption">{t.code}</Typography>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button variant="contained">Simular en este dispositivo</Button>
    </Container>
  )
}
