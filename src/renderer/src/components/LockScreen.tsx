import { useState, useRef } from 'react'

interface LockScreenProps {
  onUnlock: () => void
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

  async function handleSubmit() {
    if (!pin || pin.length < 4) {
      setError('PIN erforderlich (4 Ziffern)')
      return
    }

    setLoading(true)
    const res = await window.hcloud.appconfig.verifyPin(pin)
    setLoading(false)

    if (res.success && res.data) {
      const unlockRes = await window.hcloud.appconfig.unlock()
      if (unlockRes.success) {
        setPin('')
        setError('')
        onUnlock()
      }
    } else {
      setError('PIN falsch!')
      setPin('')
    }
  }

  const handleDigitInput = (index: number, value: string) => {
    // Nur Ziffern akzeptieren
    const digit = value.replace(/[^0-9]/g, '')
    if (!digit) return

    const newPin = pin.split('')
    newPin[index] = digit
    const newFullPin = newPin.join('').slice(0, 4)
    setPin(newFullPin)
    setError('')

    // Automatisch zum nächsten Feld springen
    if (digit && index < 3) {
      inputs.current[index + 1]?.focus()
    }

    // Automatisch absenden wenn alle 4 Ziffern eingegeben
    if (newFullPin.length === 4) {
      setTimeout(() => {
        handleSubmit()
      }, 100)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newPin = pin.slice(0, index)
      setPin(newPin)
      if (index > 0) {
        inputs.current[index - 1]?.focus()
      }
    } else if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 3) {
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
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
        <div style={{ fontSize: 48 }}>🔐</div>
        <h1 style={{ color: 'var(--tx)', fontSize: 20, fontWeight: 600, margin: 0 }}>
          hcloud-manager
        </h1>
        <p style={{ color: 'var(--tx3)', fontSize: 12, margin: 0 }}>PIN erforderlich</p>

        <div
          style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center'
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el
              }}
              type="password"
              value={pin[i] || ''}
              onChange={(e) => handleDigitInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              maxLength={1}
              inputMode="numeric"
              style={{
                width: 50,
                height: 50,
                fontSize: 24,
                fontWeight: 600,
                textAlign: 'center',
                borderRadius: 8,
                border: `2px solid ${error ? 'var(--red)' : 'var(--bdr)'}`,
                background: 'var(--bg2)',
                color: 'var(--tx)',
                fontFamily: 'monospace'
              }}
            />
          ))}
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || pin.length < 4}
          style={{
            padding: '8px 24px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 6,
            background: pin.length === 4 ? 'var(--red)' : 'var(--bg3)',
            border: 'none',
            color: pin.length === 4 ? '#fff' : 'var(--tx3)',
            cursor: pin.length === 4 ? 'pointer' : 'not-allowed',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Überprüfung…' : 'Entsperren'}
        </button>
      </div>
    </div>
  )
}
