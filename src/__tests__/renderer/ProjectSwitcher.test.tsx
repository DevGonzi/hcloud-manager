import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectSwitcher } from '../../renderer/src/components/projects/ProjectSwitcher'
import { useProjectStore } from '../../renderer/src/stores/project.store'
import { useServerStore } from '../../renderer/src/stores/server.store'

vi.mock('../../renderer/src/stores/project.store')
vi.mock('../../renderer/src/stores/server.store')

describe('ProjectSwitcher', () => {
  beforeEach(() => {
    vi.mocked(useProjectStore).mockReturnValue({
      projects: [
        { id: '1', name: 'Prod', readonly: false },
        { id: '2', name: 'Dev', readonly: true },
      ],
      activeProjectId: '1',
      setActiveProject: vi.fn(),
      loading: false,
      error: null,
      loadProjects: vi.fn(),
      addProject: vi.fn(),
      removeProject: vi.fn(),
    } as any)

    vi.mocked(useServerStore).mockReturnValue({
      loadServers: vi.fn(),
    } as any)
  })

  it('zeigt aktiven Projektnamen', () => {
    render(<ProjectSwitcher />)
    expect(screen.getByText('Prod')).toBeInTheDocument()
  })

  it('öffnet Dropdown bei Klick', () => {
    render(<ProjectSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: /Prod/i }))
    expect(screen.getByText('Dev')).toBeInTheDocument()
  })

  it('zeigt R Badge für readonly-Projekte', () => {
    render(<ProjectSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: /Prod/i }))
    expect(screen.getByText('R')).toBeInTheDocument()
  })
})
