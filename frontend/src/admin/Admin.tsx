import React, { useState } from 'react'
import { Container, Typography, TextField, Button } from '@mui/material'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [adminJson, setAdminJson] = useState('')
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin-token'))

  function login() {
    // simple password -> token exchange (client-side demo)
    if (password === 'admin123') {
      const t = 'token-' + Math.random().toString(36).slice(2)
      localStorage.setItem('admin-token', t)
      setToken(t)
      alert('Autenticado (demo)')
    } else {
      alert('Password incorrecta (demo usa admin123)')
    }
  }

  async function publish() {
    if (!token) return alert('No autenticado')
    try {
      const payload = JSON.parse(adminJson)
      const res = await fetch('/api/admin/fixture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(payload)
      })
      if (res.ok) alert('Fixture publicado')
      else alert('Error al publicar')
    } catch (e) {
      alert('JSON inválido')
    }
  }

  return (
    <Container>
      <Typography variant="h4">Panel Admin</Typography>
      {!token ? (
        <div style={{marginTop:12}}>
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <Button variant="contained" onClick={login} style={{marginLeft:8}}>Login</Button>
        </div>
      ) : (
        <div style={{marginTop:12}}>
          <Typography>Autenticado (demo) — token guardado localmente</Typography>
          <TextField
            multiline
            minRows={8}
            fullWidth
            value={adminJson}
            onChange={e => setAdminJson(e.target.value)}
            placeholder='Pegar JSON del fixture aquí (ej: {"groups":[...]})'
            style={{marginTop:12}}
          />
          <Button variant="contained" onClick={publish} style={{marginTop:8}}>Publicar</Button>
        </div>
      )}
    </Container>
  )
}
