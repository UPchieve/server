const userId = 123
const ping = () =>
  fetch(`/api/track/ping/`, { method: 'POST', credentials: 'include' })
const closeData = new FormData()
closeData.append('userId', userId)

// ping immediately on load
ping()

// regular pings every 30 s while tab is visible
const PING_INTERVAL = 30 * 1000
let timer = setInterval(ping, PING_INTERVAL)

// stop pinging if tab loses focus
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon(`/api/track/done`, data)
    clearInterval(timer)
  } else {
    ping() // resume immediately
    timer = setInterval(ping, 30_000)
  }
})
