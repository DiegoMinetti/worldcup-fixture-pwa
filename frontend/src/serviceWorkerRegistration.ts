// Minimal service worker registration helper for later PWA enablement
export function register() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {})
  }
}
