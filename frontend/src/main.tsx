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

// In development, ensure any existing service workers and caches are removed
// to avoid stale assets interfering with HMR. In production register the SW.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (import.meta && import.meta.env && import.meta.env.PROD) {
	register()
} else {
	// unregister any existing SWs and clear caches in dev
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	import('./serviceWorkerRegistration').then(mod => mod.unregister()).catch(() => {})
}
