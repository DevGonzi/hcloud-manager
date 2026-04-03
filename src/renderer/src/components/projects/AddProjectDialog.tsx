import { useState } from 'react'
import { useProjectStore } from '../../stores/project.store'
import { useT } from '../../i18n/useT'

interface Props {
  onClose: () => void
}

export function AddProjectDialog({ onClose }: Props) {
  const { t } = useT()
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [readonly, setReadonly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameInputFocused, setNameInputFocused] = useState(false)
  const [apiKeyInputFocused, setApiKeyInputFocused] = useState(false)
  const addProject = useProjectStore((s) => s.addProject)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !apiKey.trim()) {
      setError(t('project.errorRequired'))
      return
    }
    setLoading(true)
    setError(null)
    await addProject(name.trim(), apiKey.trim(), readonly)
    setLoading(false)
    onClose()
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%',
    background: 'var(--bg3)',
    border: `1px solid ${focused ? 'var(--red)' : 'var(--bdr)'}`,
    borderRadius: 6,
    padding: '6px 10px',
    color: 'var(--tx)',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box'
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200
      }}
    >
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--bdr2)',
          borderRadius: 12,
          padding: 24,
          width: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', margin: 0 }}>
          {t('project.addTitle')}
        </h2>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label
              style={{
                fontSize: 11,
                color: 'var(--tx2)',
                display: 'block',
                marginBottom: 4
              }}
            >
              {t('project.name')}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameInputFocused(true)}
              onBlur={() => setNameInputFocused(false)}
              style={inputStyle(nameInputFocused)}
              placeholder={t('project.namePlaceholder')}
              autoFocus
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                color: 'var(--tx2)',
                display: 'block',
                marginBottom: 4
              }}
            >
              {t('project.apiKey')}
            </label>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onFocus={() => setApiKeyInputFocused(true)}
              onBlur={() => setApiKeyInputFocused(false)}
              type="password"
              style={{ ...inputStyle(apiKeyInputFocused), fontFamily: 'JetBrains Mono, monospace' }}
              placeholder={t('project.apiKeyPlaceholder')}
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--tx2)',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={readonly}
              onChange={(e) => setReadonly(e.target.checked)}
            />
            {t('project.readonly')}
          </label>

          {error && <p style={{ fontSize: 12, color: 'var(--red)', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: 'var(--bg3)',
                border: '1px solid var(--bdr)',
                color: 'var(--tx2)',
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: 'var(--red)',
                border: '1px solid var(--red)',
                color: '#fff',
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? t('common.saving') : t('project.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
