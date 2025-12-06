import React, { useEffect, useState } from 'react'
import { Container, Typography, TextField, Button, Paper, IconButton } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteIcon from '@mui/icons-material/Delete'

type Team = { name: string; code: string }
type Group = { name: string; teams: Team[] }

export default function Admin() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [fixture, setFixture] = useState<{ groups: Group[] }>({ groups: [] })

  useEffect(() => {
    // try to fetch fixture to populate editor
    fetch('/api/fixture')
      .then(r => r.json())
      .then(d => {
        if (d && d.groups) setFixture(d)
      }).catch(() => {})
  }, [])

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
    } catch {
      alert('Error de red')
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    setIsAuthenticated(false)
    alert('Sesión cerrada')
  }

  function addGroup() {
    setFixture(s => ({ groups: [...s.groups, { name: `Group ${s.groups.length + 1}`, teams: [] }] }))
  }

  function addTeam(gIndex: number) {
    setFixture(s => {
      const copy = JSON.parse(JSON.stringify(s)) as typeof s
      copy.groups[gIndex].teams.push({ name: 'New Team', code: 'XXX' })
      return copy
    })
  }

  function removeTeam(gIndex: number, tIndex: number) {
    setFixture(s => {
      const copy = JSON.parse(JSON.stringify(s)) as typeof s
      copy.groups[gIndex].teams.splice(tIndex, 1)
      return copy
    })
  }

  function moveTeam(gIndex: number, tIndex: number, dir: number) {
    setFixture(s => {
      const copy = JSON.parse(JSON.stringify(s)) as typeof s
      const arr = copy.groups[gIndex].teams
      const ni = tIndex + dir
      if (ni < 0 || ni >= arr.length) return copy
      const tmp = arr[ni]
      arr[ni] = arr[tIndex]
      arr[tIndex] = tmp
      return copy
    })
  }

  function updateTeamField(gIndex: number, tIndex: number, field: keyof Team, value: string) {
    setFixture(s => {
      const copy = JSON.parse(JSON.stringify(s)) as typeof s
      copy.groups[gIndex].teams[tIndex][field] = value
      return copy
    })
  }

  function updateGroupName(gIndex: number, value: string) {
    setFixture(s => {
      const copy = JSON.parse(JSON.stringify(s)) as typeof s
      copy.groups[gIndex].name = value
      return copy
    })
  }

  function validateFixture(f: typeof fixture) {
    if (!Array.isArray(f.groups)) return false
    for (const g of f.groups) {
      if (!g.name || !Array.isArray(g.teams) || g.teams.length < 1) return false
      for (const t of g.teams) if (!t.name || !t.code) return false
    }
    return true
  }

  async function publish() {
    if (!isAuthenticated) return alert('No autenticado')
    if (!validateFixture(fixture)) return alert('Fixture inválido — revisá nombres y equipos')
    try {
      const res = await fetch('/api/admin/fixture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(fixture)
      })
      if (res.ok) alert('Fixture publicado')
      else {
        const body = await res.json()
        alert(body.error || 'Error al publicar')
      }
    } catch {
      alert('Error de red al publicar')
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
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <Typography>Autenticado</Typography>
            <Button variant="outlined" onClick={logout}>Logout</Button>
            <Button variant="contained" onClick={addGroup}>Agregar Grupo</Button>
            <Button color="success" variant="contained" onClick={publish}>Publicar Fixture</Button>
          </div>

          <div style={{marginTop:16}}>
            {fixture.groups.map((g, gi) => (
              <Paper key={gi} style={{padding:12, marginBottom:12}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <TextField label="Group" value={g.name} onChange={e => updateGroupName(gi, e.target.value)} />
                  <Button onClick={() => addTeam(gi)}>Agregar Equipo</Button>
                </div>
                <div style={{marginTop:8}}>
                  {g.teams.map((t, ti) => (
                    <div key={ti} style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
                      <TextField label="Nombre" value={t.name} onChange={e => updateTeamField(gi, ti, 'name', e.target.value)} />
                      <TextField label="Codigo" value={t.code} onChange={e => updateTeamField(gi, ti, 'code', e.target.value)} style={{width:120}} />
                      <IconButton onClick={() => moveTeam(gi, ti, -1)}><ArrowUpwardIcon /></IconButton>
                      <IconButton onClick={() => moveTeam(gi, ti, 1)}><ArrowDownwardIcon /></IconButton>
                      <IconButton onClick={() => removeTeam(gi, ti)}><DeleteIcon /></IconButton>
                    </div>
                  ))}
                </div>
              </Paper>
            ))}
          </div>
        </div>
      )}
    </Container>
  )
}
