import { useState, useRef } from 'react'
import { Lock, AlertTriangle, X } from 'lucide-react'

interface LockScreenProps {
  onUnlock: () => void
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null])

  async function handleSubmit() {
    if (pin.length < 6) return
    setLoading(true)
    const res = await window.hcloud.appconfig.verifyPin(pin)
    setLoading(false)
    if (res.success && res.data) {
      await window.hcloud.appconfig.unlock()
      setPin('')
      setError('')
      onUnlock()
    } else {
      setError('PIN falsch!')
      setPin('')
      inputs.current[0]?.focus()
    }
  }

  async function handleReset() {
    setResetting(true)
    await window.hcloud.appconfig.resetPin()
    setResetting(false)
    onUnlock()
  }

  const handleDigitInput = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '')
    if (!digit) return
    const newPin = pin.split('')
    newPin[index] = digit
    const newFullPin = newPin.join('').slice(0, 6)
    setPin(newFullPin)
    setError('')
    if (index < 5) inputs.current[index + 1]?.focus()
    if (newFullPin.length === 6) setTimeout(handleSubmit, 100)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      setPin(pin.slice(0, index))
      if (index > 0) inputs.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--bg1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999
      }}
    >
      {/* Titlebar / drag region */}
      <div
        style={{
          height: 50,
          flexShrink: 0,
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--bdr)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 12,
          paddingRight: 12,
          WebkitAppRegion: 'drag'
        } as React.CSSProperties}
      >
        <div style={{ fontSize: 12, color: 'var(--tx2)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={13} /> Gesperrt</div>
        <button
          onClick={() => window.hcloud.window.close()}
          style={{
            width: 32,
            height: 32,
            background: 'none',
            border: 'none',
            color: 'var(--tx3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            WebkitAppRegion: 'no-drag'
          } as React.CSSProperties}
        >
          <X size={14} />
        </button>
      </div>

      {/* content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {showReset ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              padding: 32,
              maxWidth: 320,
              textAlign: 'center'
            }}
          >
            <div style={{ color: 'var(--red)' }}><AlertTriangle size={36} /></div>
            <p style={{ color: 'var(--tx)', fontSize: 14, fontWeight: 600, margin: 0 }}>
              PIN zurücksetzen?
            </p>
            <p style={{ color: 'var(--tx3)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              Das löscht den PIN <strong style={{ color: 'var(--tx2)' }}>und alle gespeicherten
              API-Schlüssel</strong>. Danach musst du deine Projekte neu einrichten.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => setShowReset(false)}
                style={{
                  padding: '7px 20px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid var(--bdr)',
                  background: 'none',
                  color: 'var(--tx2)',
                  cursor: 'pointer'
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                style={{
                  padding: '7px 20px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--red)',
                  color: '#fff',
                  cursor: resetting ? 'not-allowed' : 'pointer',
                  opacity: resetting ? 0.7 : 1
                }}
              >
                {resetting ? 'Wird zurückgesetzt…' : 'Ja, alles löschen'}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
              padding: 32,
              textAlign: 'center'
            }}
          >
            <h1 style={{ color: 'var(--tx)', fontSize: 20, fontWeight: 600, margin: 0 }}>
              hcloud<span style={{ color: 'var(--red)' }}>-manager</span>
            </h1>
            <p style={{ color: 'var(--tx3)', fontSize: 12, margin: 0 }}>PIN erforderlich</p>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el }}
                  type="password"
                  value={pin[i] || ''}
                  onChange={(e) => handleDigitInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  maxLength={1}
                  inputMode="numeric"
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 22,
                    fontWeight: 600,
                    textAlign: 'center',
                    borderRadius: 8,
                    border: `2px solid ${error ? 'var(--red)' : 'var(--bdr)'}`,
                    background: 'var(--bg2)',
                    color: 'var(--tx)',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || pin.length < 6}
              style={{
                padding: '8px 28px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                background: pin.length === 6 ? 'var(--red)' : 'var(--bg3)',
                border: 'none',
                color: pin.length === 6 ? '#fff' : 'var(--tx3)',
                cursor: pin.length === 6 ? 'pointer' : 'not-allowed',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Überprüfung…' : 'Entsperren'}
            </button>

            <button
              onClick={() => setShowReset(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--tx3)',
                fontSize: 11,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                marginTop: -8
              }}
            >
              PIN vergessen?
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
