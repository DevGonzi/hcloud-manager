interface NavItem {
  icon: string
  label: string
  section: string
}

const sections = [
  {
    label: 'Compute',
    items: [
      { icon: '▣', label: 'Servers', section: 'servers' },
      { icon: '◫', label: 'Snapshots', section: 'snapshots' },
      { icon: '⊞', label: 'Images', section: 'images' },
    ],
  },
  {
    label: 'Networking',
    items: [
      { icon: '⊗', label: 'Networks', section: 'networks' },
      { icon: '◈', label: 'Firewalls', section: 'firewalls' },
      { icon: '◉', label: 'Floating IPs', section: 'floating-ips' },
      { icon: '⊕', label: 'Load Balancers', section: 'load-balancers' },
    ],
  },
  {
    label: 'Storage & Access',
    items: [
      { icon: '◧', label: 'Volumes', section: 'volumes' },
      { icon: '⊡', label: 'SSH Keys', section: 'ssh-keys' },
    ],
  },
]

interface Props {
  activeSection: string
  onSectionChange: (section: string) => void
  serverCount?: number
}

export function Sidebar({ activeSection, onSectionChange, serverCount }: Props) {
  return (
    <nav className="w-[200px] bg-bg-2 border-r border-border flex flex-col flex-shrink-0 overflow-y-auto">
      {sections.map(section => (
        <div key={section.label} className="pt-3 pb-1">
          <div className="px-3.5 pb-1.5 text-[9px] font-semibold text-text-3 uppercase tracking-[0.1em] font-mono">
            {section.label}
          </div>
          {section.items.map(item => (
            <NavLink
              key={item.section}
              item={item}
              active={activeSection === item.section}
              count={item.section === 'servers' ? serverCount : undefined}
              onClick={() => onSectionChange(item.section)}
            />
          ))}
        </div>
      ))}

      <div className="mt-auto border-t border-border py-2">
        <NavLink
          item={{ icon: '⚙', label: 'Einstellungen', section: 'settings' }}
          active={activeSection === 'settings'}
          onClick={() => onSectionChange('settings')}
        />
      </div>
    </nav>
  )
}

function NavLink({ item, active, count, onClick }: {
  item: NavItem
  active: boolean
  count?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs font-medium transition-all
        border-l-2 text-left
        ${active
          ? 'bg-accent-glow text-text border-accent'
          : 'text-text-2 border-transparent hover:bg-bg-3 hover:text-text'
        }
      `}
    >
      <span className="w-4 text-center flex-shrink-0">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {count !== undefined && (
        <span className={`text-[10px] rounded-full px-1.5 py-px font-mono ${
          active ? 'bg-accent-dim text-red-300' : 'bg-bg-4 text-text-3'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}
