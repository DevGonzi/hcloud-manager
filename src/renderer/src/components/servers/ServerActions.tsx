import type { HCloudServer } from '../../../../shared/types'

interface Props {
  server: HCloudServer
  readonly: boolean
  onAction: (action: 'start' | 'shutdown' | 'reboot') => void
}

export function ServerActions({ server, readonly, onAction }: Props) {
  const isRunning = server.status === 'running'

  const actions = [
    { action: 'start' as const,    label: 'Start',   icon: '▶', disabled: isRunning },
    { action: 'shutdown' as const, label: 'Stop',    icon: '⏹', disabled: !isRunning },
    { action: 'reboot' as const,   label: 'Reboot',  icon: '↺', disabled: !isRunning },
  ]

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {actions.map(a => (
        <button
          key={a.action}
          disabled={readonly || a.disabled}
          onClick={() => onAction(a.action)}
          className="flex flex-col items-center gap-1 py-2 px-1.5 text-[11px] font-medium rounded-md border transition-all
            bg-bg-3 border-border text-text-2
            hover:bg-bg-4 hover:border-border-2 hover:text-text
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-base">{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  )
}
