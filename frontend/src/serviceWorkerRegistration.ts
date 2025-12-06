// Minimal service worker registration helper for later PWA enablement
export function register() {
  // register service worker only in production to avoid caching dev assets
  // Vite exposes import.meta.env.PROD
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (import.meta && import.meta.env && import.meta.env.PROD) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {})
    }
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach(r => r.unregister())
    })
  }
}
