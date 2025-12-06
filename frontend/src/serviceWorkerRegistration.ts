// Minimal service worker registration helper for later PWA enablement
export function register() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {})
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach(r => r.unregister())
    })
  }
}
