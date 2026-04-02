import { useState } from 'react'
import { useProjectStore } from '../../stores/project.store'

interface Props {
  onClose: () => void
}

export function AddProjectDialog({ onClose }: Props) {
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [readonly, setReadonly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addProject = useProjectStore(s => s.addProject)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !apiKey.trim()) {
      setError('Name und API-Key sind erforderlich')
      return
    }
    setLoading(true)
    setError(null)
    await addProject(name.trim(), apiKey.trim(), readonly)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-bg-3 border border-border-2 rounded-xl p-5 w-[360px] shadow-2xl">
        <h2 className="text-sm font-semibold text-text mb-4">Projekt hinzufügen</h2>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-3 uppercase tracking-wider font-mono block mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-bg-4 border border-border rounded-md px-3 py-2 text-sm text-text outline-none focus:border-accent transition-all"
              placeholder="GonziTech Prod"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-3 uppercase tracking-wider font-mono block mb-1">
              Hetzner API Key
            </label>
            <input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              type="password"
              className="w-full bg-bg-4 border border-border rounded-md px-3 py-2 text-sm text-text font-mono outline-none focus:border-accent transition-all"
              placeholder="hv1-••••••••"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-text-2 cursor-pointer">
            <input
              type="checkbox"
              checked={readonly}
              onChange={e => setReadonly(e.target.checked)}
              className="accent-accent"
            />
            Readonly (nur lesender Zugriff)
          </label>

          {error && <p className="text-xs text-accent">{error}</p>}

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs text-text-2 bg-bg-4 border border-border rounded-md hover:border-border-2 transition-all"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-xs text-white bg-accent border border-accent rounded-md hover:bg-accent-dim transition-all disabled:opacity-50"
            >
              {loading ? 'Speichern…' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
