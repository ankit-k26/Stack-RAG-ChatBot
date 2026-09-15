/**
 * keepAlive.js
 *
 * Self-pings the server's /api/ping endpoint every INTERVAL_MS milliseconds
 * so Render's free-tier dyno never goes to sleep during active use.
 *
 * Call startKeepAlive(baseUrl) once the HTTP server is listening.
 * The interval is cleared automatically if the process exits.
 */

const INTERVAL_MS = 7 * 60 * 1000 // 7 minutes (Render sleeps after 15 min)

export function startKeepAlive(baseUrl) {
  const pingUrl = `${baseUrl}/api/ping`

  const tick = async () => {
    try {
      const res = await fetch(pingUrl)
      if (res.ok) {
        console.log(`[keepAlive] ✓ pinged ${pingUrl}`)
      } else {
        console.warn(`[keepAlive] ✗ ping returned ${res.status}`)
      }
    } catch (err) {
      console.warn(`[keepAlive] ✗ ping failed: ${err.message}`)
    }
  }

  const id = setInterval(tick, INTERVAL_MS)

  // Ensure the interval is cleared on graceful shutdown so it doesn't
  // keep the process alive after SIGTERM.
  const cleanup = () => clearInterval(id)
  process.once('SIGTERM', cleanup)
  process.once('SIGINT', cleanup)

  console.log(
    `[keepAlive] Self-ping started — every ${INTERVAL_MS / 60_000} min → ${pingUrl}`
  )
}
