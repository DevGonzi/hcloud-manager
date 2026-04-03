import { useState, useEffect } from 'react'
import { useProjectStore } from '../stores/project.store'
import { useT } from '../i18n/useT'

const card: React.CSSProperties = {
  background: 'var(--bg3)',
  border: '1px solid var(--bdr)',
  borderRadius: 8,
  padding: '12px 16px'
}

const sectionLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  color: 'var(--tx3)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontFamily: 'JetBrains Mono, monospace',
  marginBottom: 12
}

const divider: React.CSSProperties = {
  height: 1,
  background: 'var(--bdr)',
  margin: '6px 0'
}

export function SettingsPage() {
  const { t, lang, setLang } = useT()
  const { projects, activeProjectId, removeProject, setActiveProject } = useProjectStore()
  const activeProject = projects.find((p) => p.id === activeProjectId)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [hasPinSet, setHasPinSet] = useState(false)
  const [showPinForm, setShowPinForm] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [oldPin, setOldPin] = useState('')

  useEffect(() => {
    window.hcloud.appconfig.getHasPinSet().then((res) => {
      if (res.success) setHasPinSet(res.data)
    })
  }, [])

  async function handleRemoveProject(id: string) {
    await removeProject(id)
    setConfirmDelete(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      {/* header */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--bdr)',
          background: 'var(--bg2)',
          flexShrink: 0
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>
          {t('settings.title')}
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'var(--tx3)',
            fontFamily: 'JetBrains Mono, monospace',
            marginTop: 1
          }}
        >
          {t('settings.subtitle')}
        </div>
      </div>

      <div
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 640
        }}
      >
        {/* Active Project */}
        {activeProject && (
          <section>
            <div style={sectionLabel}>{t('settings.activeProject')}</div>
            <div style={card}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)' }}>
                  {activeProject.name}
                </span>
                {activeProject.readonly && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      background: 'var(--tx3)',
                      color: 'var(--bg1)',
                      borderRadius: 3,
                      padding: '1px 6px'
                    }}
                  >
                    {t('common.readonly').toUpperCase()}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: 'var(--tx3)',
                  marginBottom: 6
                }}
              >
                ID: {activeProject.id}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: activeProject.readonly ? 'var(--tx3)' : 'var(--green)',
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: 10, color: 'var(--tx3)' }}>
                  {activeProject.readonly
                    ? t('settings.readonlyHint')
                    : t('settings.readwriteHint')}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* All Projects */}
        <section>
          <div style={sectionLabel}>{t('settings.allProjects')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projects.map((p) => {
              const isActive = p.id === activeProjectId
              return (
                <div
                  key={p.id}
                  style={{
                    ...card,
                    border: `1px solid ${isActive ? 'var(--red-dim)' : 'var(--bdr)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)' }}>
                        {p.name}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: 'var(--red)',
                            fontFamily: 'JetBrains Mono, monospace'
                          }}
                        >
                          AKTIV
                        </span>
                      )}
                      {p.readonly && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            background: 'rgba(82,94,120,0.2)',
                            color: 'var(--tx3)',
                            borderRadius: 3,
                            padding: '1px 5px'
                          }}
                        >
                          RO
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--tx3)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {p.id}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {!isActive && (
                      <button
                        onClick={() => setActiveProject(p.id)}
                        style={{
                          padding: '3px 10px',
                          fontSize: 10,
                          border: '1px solid var(--bdr)',
                          borderRadius: 4,
                          color: 'var(--tx2)',
                          background: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          ;(e.target as HTMLElement).style.borderColor = 'var(--bdr2)'
                          ;(e.target as HTMLElement).style.color = 'var(--tx)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.target as HTMLElement).style.borderColor = 'var(--bdr)'
                          ;(e.target as HTMLElement).style.color = 'var(--tx2)'
                        }}
                      >
                        {t('settings.activate')}
                      </button>
                    )}
                    {confirmDelete === p.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--red)' }}>
                          {t('common.sure')}
                        </span>
                        <button
                          onClick={() => handleRemoveProject(p.id)}
                          style={{
                            padding: '2px 8px',
                            fontSize: 10,
                            background: 'var(--red)',
                            border: '1px solid var(--red)',
                            borderRadius: 4,
                            color: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          {t('common.yes')}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{
                            padding: '2px 8px',
                            fontSize: 10,
                            border: '1px solid var(--bdr)',
                            borderRadius: 4,
                            color: 'var(--tx3)',
                            background: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {t('common.no')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(p.id)}
                        style={{
                          padding: '3px 10px',
                          fontSize: 10,
                          border: '1px solid var(--bdr)',
                          borderRadius: 4,
                          color: 'var(--tx3)',
                          background: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          ;(e.target as HTMLElement).style.borderColor = 'var(--red)'
                          ;(e.target as HTMLElement).style.color = 'var(--red)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.target as HTMLElement).style.borderColor = 'var(--bdr)'
                          ;(e.target as HTMLElement).style.color = 'var(--tx3)'
                        }}
                      >
                        {t('settings.remove')}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Language */}
        <section>
          <div style={sectionLabel}>{t('settings.language')}</div>
          <div style={card}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setLang('de')}
                style={{
                  padding: '5px 16px',
                  fontSize: 12,
                  fontWeight: lang === 'de' ? 600 : 400,
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: lang === 'de' ? 'var(--red)' : 'var(--bg4)',
                  border: `1px solid ${lang === 'de' ? 'var(--red)' : 'var(--bdr)'}`,
                  color: lang === 'de' ? '#fff' : 'var(--tx2)'
                }}
              >
                DE
              </button>
              <button
                onClick={() => setLang('en')}
                style={{
                  padding: '5px 16px',
                  fontSize: 12,
                  fontWeight: lang === 'en' ? 600 : 400,
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: lang === 'en' ? 'var(--red)' : 'var(--bg4)',
                  border: `1px solid ${lang === 'en' ? 'var(--red)' : 'var(--bdr)'}`,
                  color: lang === 'en' ? '#fff' : 'var(--tx2)'
                }}
              >
                EN
              </button>
            </div>
          </div>
        </section>

        {/* App Info */}
        <section>
          <div style={sectionLabel}>{t('settings.appInfo')}</div>
          <div style={card}>
            {[
              { label: t('settings.version'), value: '0.1.0' },
              { label: t('settings.api'), value: 'api.hetzner.cloud/v1' },
              { label: t('settings.cacheTtl'), value: '30s' }
            ].map((row, i, arr) => (
              <div key={row.label}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 0'
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--tx2)' }}>{row.label}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: 'var(--tx)'
                    }}
                  >
                    {row.value}
                  </span>
                </div>
                {i < arr.length - 1 && <div style={divider} />}
              </div>
            ))}
            <div style={divider} />
            <div style={{ padding: '6px 0', fontSize: 11, color: 'var(--tx3)' }}>
              Made with ❤️ by DevGonzi from Gonzi.Tech
            </div>
          </div>
        </section>

        {/* PIN Protection */}
        <section>
          <div style={sectionLabel}>🔒 PIN {t('common.security') || 'Schutz'}</div>
          {!showPinForm && (
            <div style={card}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--tx2)' }}>
                  PIN ist {hasPinSet ? '✅ aktiv' : '❌ inaktiv'}
                </span>
                <button
                  onClick={() => setShowPinForm(true)}
                  style={{
                    padding: '5px 12px',
                    fontSize: 11,
                    border: '1px solid var(--bdr)',
                    borderRadius: 4,
                    color: 'var(--tx2)',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    ;(e.target as HTMLElement).style.borderColor = 'var(--bdr2)'
                    ;(e.target as HTMLElement).style.color = 'var(--tx)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.target as HTMLElement).style.borderColor = 'var(--bdr)'
                    ;(e.target as HTMLElement).style.color = 'var(--tx2)'
                  }}
                >
                  {hasPinSet ? 'Ändern' : 'Setzen'}
                </button>
              </div>
            </div>
          )}

          {showPinForm && (
            <div style={card}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {hasPinSet && (
                  <div>
                    <label style={{ fontSize: 10, color: 'var(--tx3)', display: 'block', marginBottom: 4 }}>
                      Alter PIN
                    </label>
                    <input
                      type="password"
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: 12,
                        border: '1px solid var(--bdr)',
                        borderRadius: 4,
                        background: 'var(--bg2)',
                        color: 'var(--tx)',
                        fontFamily: 'monospace'
                      }}
                      placeholder="••••"
                    />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 10, color: 'var(--tx3)', display: 'block', marginBottom: 4 }}>
                    Neuer PIN (4 Ziffern)
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      fontSize: 12,
                      border: '1px solid var(--bdr)',
                      borderRadius: 4,
                      background: 'var(--bg2)',
                      color: 'var(--tx)',
                      fontFamily: 'monospace'
                    }}
                    placeholder="••••"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--tx3)', display: 'block', marginBottom: 4 }}>
                    PIN bestätigen
                  </label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      fontSize: 12,
                      border: '1px solid var(--bdr)',
                      borderRadius: 4,
                      background: 'var(--bg2)',
                      color: 'var(--tx)',
                      fontFamily: 'monospace'
                    }}
                    placeholder="••••"
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={async () => {
                      if (!newPin || !confirmPin || newPin !== confirmPin || newPin.length < 4) {
                        alert('PINs müssen 4 Ziffern sein und übereinstimmen')
                        return
                      }
                      if (hasPinSet && !oldPin) {
                        alert('Alter PIN erforderlich')
                        return
                      }
                      if (hasPinSet) {
                        const verified = await window.hcloud.appconfig.verifyPin(oldPin)
                        if (!verified.success || !verified.data) {
                          alert('Alter PIN ist falsch')
                          return
                        }
                      }
                      const res = await window.hcloud.appconfig.setPin(newPin)
                      if (res.success) {
                        setHasPinSet(true)
                        setNewPin('')
                        setConfirmPin('')
                        setOldPin('')
                        setShowPinForm(false)
                        alert('PIN gespeichert!')
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      fontSize: 11,
                      background: 'var(--green)',
                      border: '1px solid var(--green)',
                      borderRadius: 4,
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => {
                      setShowPinForm(false)
                      setNewPin('')
                      setConfirmPin('')
                      setOldPin('')
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      fontSize: 11,
                      border: '1px solid var(--bdr)',
                      borderRadius: 4,
                      color: 'var(--tx2)',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
