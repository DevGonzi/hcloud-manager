import { useState } from 'react'
import { useT } from '../../i18n'

interface NavItem {
  icon: string
  label: string
  section: string
}

interface Props {
  activeSection: string
  onSectionChange: (section: string) => void
  serverCount?: number
}

export function Sidebar({ activeSection, onSectionChange, serverCount }: Props) {
  const { t } = useT()

  const sections = [
    {
      label: t('nav.compute'),
      items: [
        { icon: '▣', label: t('nav.servers'), section: 'servers' },
        { icon: '◫', label: t('nav.snapshots'), section: 'snapshots' },
        { icon: '⊞', label: t('nav.images'), section: 'images' }
      ]
    },
    {
      label: t('nav.networking'),
      items: [
        { icon: '⊗', label: t('nav.networks'), section: 'networks' },
        { icon: '◈', label: t('nav.firewalls'), section: 'firewalls' },
        { icon: '◉', label: t('nav.floatingIps'), section: 'floating-ips' },
        { icon: '⊕', label: t('nav.loadBalancers'), section: 'load-balancers' }
      ]
    },
    {
      label: t('nav.storageAccess'),
      items: [
        { icon: '◧', label: t('nav.volumes'), section: 'volumes' },
        { icon: '⊡', label: t('nav.sshKeys'), section: 'ssh-keys' }
      ]
    }
  ]

  return (
    <nav
      style={{
        width: 200,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--bdr)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto'
      }}
    >
      {sections.map((section) => (
        <div key={section.label} style={{ paddingTop: 12, paddingBottom: 4 }}>
          <div
            style={{
              padding: '0 14px 6px',
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--tx3)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {section.label}
          </div>
          {section.items.map((item) => (
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

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--bdr)', padding: '8px 0' }}>
        <NavLink
          item={{ icon: '📋', label: 'Activity', section: 'activity' }}
          active={activeSection === 'activity'}
          onClick={() => onSectionChange('activity')}
        />
        <NavLink
          item={{ icon: '⚙', label: t('nav.settings'), section: 'settings' }}
          active={activeSection === 'settings'}
          onClick={() => onSectionChange('settings')}
        />
      </div>
    </nav>
  )
}

function NavLink({
  item,
  active,
  count,
  onClick
}: {
  item: NavItem
  active: boolean
  count?: number
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '6px 14px',
    cursor: 'pointer',
    width: '100%',
    borderLeft: '2px solid transparent',
    fontSize: 12,
    fontWeight: 400,
    background: 'none',
    textAlign: 'left',
    transition: 'all 0.1s'
  }

  const activeStyle: React.CSSProperties = {
    ...baseStyle,
    background: 'var(--red-glow)',
    color: 'var(--tx)',
    borderLeftColor: 'var(--red)'
  }

  const inactiveStyle: React.CSSProperties = {
    ...baseStyle,
    color: hovered ? 'var(--tx)' : 'var(--tx2)',
    background: hovered ? 'var(--bg3)' : 'none'
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={active ? activeStyle : inactiveStyle}
    >
      <span
        style={{
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {count !== undefined && (
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            borderRadius: 10,
            padding: '1px 6px',
            marginLeft: 'auto',
            background: active ? 'var(--red-dim)' : 'var(--bg4)',
            color: active ? '#FF8095' : 'var(--tx3)'
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
