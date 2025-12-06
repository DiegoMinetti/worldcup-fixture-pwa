import React, { useState } from 'react'
import { Container, Typography, TextField, Button } from '@mui/material'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [adminJson, setAdminJson] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  async function login() {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      })
      if (res.ok) {
        setIsAuthenticated(true)
        alert('Autenticado')
      } else {
        const body = await res.json()
        alert(body.error || 'Error autenticando')
      }
    } catch (e) {
      alert('Error de red')
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    setIsAuthenticated(false)
    alert('Sesión cerrada')
  }

  async function publish() {
    if (!isAuthenticated) return alert('No autenticado')
    try {
      const payload = JSON.parse(adminJson)
      const res = await fetch('/api/admin/fixture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      if (res.ok) alert('Fixture publicado')
      else {
        const body = await res.json()
        alert(body.error || 'Error al publicar')
      }
    } catch (e) {
      alert('JSON inválido o error')
    }
  }

  return (
    <Container>
      <Typography variant="h4">Panel Admin</Typography>
      {!isAuthenticated ? (
        <div style={{marginTop:12}}>
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <Button variant="contained" onClick={login} style={{marginLeft:8}}>Login</Button>
        </div>
      ) : (
        <div style={{marginTop:12}}>
          <Typography>Autenticado</Typography>
          <Button variant="outlined" onClick={logout} style={{marginTop:8}}>Logout</Button>
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
