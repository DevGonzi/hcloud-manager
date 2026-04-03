import RFB from '@novnc/novnc/lib/rfb'

const params = new URLSearchParams(window.location.search)
const wssUrl = params.get('wss_url')
const password = params.get('password')

const statusEl = document.getElementById('status')!
const statusText = document.getElementById('status-text')!
const screen = document.getElementById('screen')!
const toolbar = document.getElementById('toolbar')!
const cadBtn = document.getElementById('cad-btn')!
const fullscreenBtn = document.getElementById('fullscreen-btn')!
const connInfo = document.getElementById('conn-info')!

function showError(msg: string) {
  statusEl.classList.add('error')
  statusEl.querySelector<HTMLElement>('.spinner')!.style.display = 'none'
  statusText.textContent = msg
}

if (!wssUrl || !password) {
  showError('Fehlende Verbindungsparameter.')
} else {
  try {
    const rfb = new RFB(screen, wssUrl, { credentials: { password } })
    rfb.scaleViewport = true
    rfb.resizeSession = true

    rfb.addEventListener('connect', () => {
      statusEl.classList.add('hidden')
      toolbar.classList.add('visible')
      screen.classList.add('with-toolbar')
      try {
        const url = new URL(wssUrl)
        connInfo.textContent = url.hostname
      } catch {
        /* ignore */
      }
    })

    rfb.addEventListener('disconnect', (e: Event) => {
      toolbar.classList.remove('visible')
      screen.classList.remove('with-toolbar')
      statusEl.classList.remove('hidden', 'error')
      statusEl.querySelector<HTMLElement>('.spinner')!.style.display = 'none'
      statusText.textContent = (e as CustomEvent<{ clean: boolean }>).detail?.clean
        ? 'Verbindung getrennt.'
        : 'Verbindung unterbrochen.'
    })

    rfb.addEventListener('credentialsrequired', () => rfb.sendCredentials({ password }))
    rfb.addEventListener('securityfailure', () => showError('Authentifizierung fehlgeschlagen.'))

    cadBtn.addEventListener('click', () =>
      (rfb as unknown as { sendCtrlAltDel: () => void }).sendCtrlAltDel()
    )

    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        fullscreenBtn.textContent = '✕ Vollbild'
      } else {
        document.exitFullscreen()
        fullscreenBtn.textContent = '⛶ Vollbild'
      }
    })
  } catch (err) {
    showError(`Fehler: ${err}`)
  }
}
