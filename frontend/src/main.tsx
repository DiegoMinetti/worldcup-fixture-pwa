import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Admin from './admin/Admin'
import { register } from './serviceWorkerRegistration'

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/admin" element={<Admin />} />
		</Routes>
	</BrowserRouter>
)

register()
