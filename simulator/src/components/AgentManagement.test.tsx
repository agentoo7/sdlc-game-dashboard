import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AgentManagement from './AgentManagement'
import { api } from '../services/api'
import type { Company, Agent } from '../types'
import { DEFAULT_ROLES, getRoleColor, getRoleDisplayName } from '../types'

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    getAgents: vi.fn(),
    createAgent: vi.fn(),
    deleteAgent: vi.fn(),
  },
}))

const mockApi = vi.mocked(api)

describe('AgentManagement', () => {
  const mockOnAgentsChange = vi.fn()
  const mockCompany: Company = {
    id: 'test-company-id',
    name: 'Test Company',
    created_at: '2026-02-04T10:00:00Z',
  }
  const mockAgent: Agent = {
    id: 'BA-001',
    company_id: 'test-company-id',
    name: 'Alice',
    role: 'ba',
    role_config: {
      display_name: 'Business Analyst',
      color: '#3B82F6',
    },
    status: 'idle',
    created_at: '2026-02-04T10:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.getAgents.mockResolvedValue({
      data: [],
      status: 200,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Task 5.1: Test form validation
  describe('AC1: Form validation', () => {
    it('shows "Select a company first" when no company selected', () => {
      render(
        <AgentManagement
          company={null}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      // Multiple instances of this text exist, check heading shows the message
      expect(screen.getByRole('heading', { name: /agent management/i })).toBeInTheDocument()
      expect(screen.getAllByText(/select a company first/i).length).toBeGreaterThan(0)
    })

    it('renders Add Agent form when company is selected', async () => {
      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      expect(screen.getByText('Add New Agent')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/agent id/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument() // Role dropdown
    })

    it('renders all default roles in dropdown', async () => {
      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      const dropdown = screen.getByRole('combobox')
      DEFAULT_ROLES.forEach((role) => {
        expect(dropdown).toContainHTML(role.label)
      })
    })

    it('shows custom role input when "Custom Role" is selected', async () => {
      const user = userEvent.setup()

      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await user.selectOptions(screen.getByRole('combobox'), 'custom')
      expect(screen.getByPlaceholderText(/custom role/i)).toBeInTheDocument()
    })

    it('shows validation error when Agent ID is empty', async () => {
      const user = userEvent.setup()

      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      // Fill only name, leave Agent ID empty
      const nameInput = screen.getByPlaceholderText(/name.*alice/i)
      await user.type(nameInput, 'Alice')

      // The Add Agent button should be disabled when Agent ID is empty
      const submitBtn = screen.getByRole('button', { name: /add agent/i })
      expect(submitBtn).toBeDisabled()
    })

    it('shows validation error when name is empty', async () => {
      const user = userEvent.setup()

      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      // Fill only Agent ID, leave name empty
      const agentIdInput = screen.getByPlaceholderText(/agent id/i)
      await user.type(agentIdInput, 'BA-001')

      // The Add Agent button should be disabled when name is empty
      const submitBtn = screen.getByRole('button', { name: /add agent/i })
      expect(submitBtn).toBeDisabled()
    })

    it('shows validation error for duplicate Agent ID', async () => {
      const user = userEvent.setup()

      render(
        <AgentManagement
          company={mockCompany}
          agents={[mockAgent]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await user.type(screen.getByPlaceholderText(/agent id/i), 'BA-001') // Same as mockAgent
      await user.type(screen.getByPlaceholderText(/name/i), 'Bob')
      await user.click(screen.getByRole('button', { name: /add agent/i }))

      await waitFor(() => {
        expect(screen.getByText(/agent id already exists/i)).toBeInTheDocument()
      })
    })
  })

  // Task 5.2: Test agent creation flow
  describe('AC2: Agent creation', () => {
    it('calls API with correct data on submit', async () => {
      const user = userEvent.setup()
      const newAgent: Agent = {
        id: 'DEV-001',
        company_id: 'test-company-id',
        name: 'Bob',
        role: 'developer',
        status: 'idle',
        created_at: '2026-02-04T10:00:00Z',
      }

      mockApi.createAgent.mockResolvedValue({
        data: newAgent,
        status: 201,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await user.type(screen.getByPlaceholderText(/agent id/i), 'DEV-001')
      await user.type(screen.getByPlaceholderText(/name/i), 'Bob')
      // Role defaults to 'developer'
      await user.click(screen.getByRole('button', { name: /add agent/i }))

      await waitFor(() => {
        expect(mockApi.createAgent).toHaveBeenCalledWith(
          'test-company-id',
          'DEV-001',
          'Bob',
          'developer'
        )
      })
    })

    it('shows success toast after agent creation', async () => {
      const user = userEvent.setup()
      const newAgent: Agent = {
        id: 'DEV-001',
        company_id: 'test-company-id',
        name: 'Bob',
        role: 'developer',
        status: 'idle',
        created_at: '2026-02-04T10:00:00Z',
      }

      mockApi.createAgent.mockResolvedValue({
        data: newAgent,
        status: 201,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await user.type(screen.getByPlaceholderText(/agent id/i), 'DEV-001')
      await user.type(screen.getByPlaceholderText(/name/i), 'Bob')
      await user.click(screen.getByRole('button', { name: /add agent/i }))

      await waitFor(() => {
        expect(screen.getByText(/agent added: dev-001/i)).toBeInTheDocument()
      })
    })

    it('clears form after successful creation', async () => {
      const user = userEvent.setup()
      const newAgent: Agent = {
        id: 'DEV-001',
        company_id: 'test-company-id',
        name: 'Bob',
        role: 'developer',
        status: 'idle',
        created_at: '2026-02-04T10:00:00Z',
      }

      mockApi.createAgent.mockResolvedValue({
        data: newAgent,
        status: 201,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      const agentIdInput = screen.getByPlaceholderText(/agent id/i) as HTMLInputElement
      const nameInput = screen.getByPlaceholderText(/name/i) as HTMLInputElement

      await user.type(agentIdInput, 'DEV-001')
      await user.type(nameInput, 'Bob')
      await user.click(screen.getByRole('button', { name: /add agent/i }))

      await waitFor(() => {
        expect(agentIdInput.value).toBe('')
        expect(nameInput.value).toBe('')
      })
    })

    it('refreshes agent list after creation', async () => {
      const user = userEvent.setup()
      const newAgent: Agent = {
        id: 'DEV-001',
        company_id: 'test-company-id',
        name: 'Bob',
        role: 'developer',
        status: 'idle',
        created_at: '2026-02-04T10:00:00Z',
      }

      mockApi.createAgent.mockResolvedValue({
        data: newAgent,
        status: 201,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      // Initial fetch on mount
      expect(mockApi.getAgents).toHaveBeenCalledTimes(1)

      await user.type(screen.getByPlaceholderText(/agent id/i), 'DEV-001')
      await user.type(screen.getByPlaceholderText(/name/i), 'Bob')
      await user.click(screen.getByRole('button', { name: /add agent/i }))

      // Should refresh after creation
      await waitFor(() => {
        expect(mockApi.getAgents).toHaveBeenCalledTimes(2)
      })
    })

    it('shows error toast when API fails', async () => {
      const user = userEvent.setup()

      mockApi.createAgent.mockResolvedValue({
        error: 'Agent ID already exists',
        status: 409,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await user.type(screen.getByPlaceholderText(/agent id/i), 'DEV-001')
      await user.type(screen.getByPlaceholderText(/name/i), 'Bob')
      await user.click(screen.getByRole('button', { name: /add agent/i }))

      await waitFor(() => {
        expect(screen.getByText(/agent id already exists/i)).toBeInTheDocument()
      })
    })
  })

  // Task 5.3: Test agent removal with confirmation
  describe('AC3: Agent removal', () => {
    beforeEach(() => {
      // Make getAgents return mockAgent so Remove buttons are visible
      mockApi.getAgents.mockResolvedValue({
        data: [mockAgent],
        status: 200,
      })
    })

    it('shows confirmation dialog when Remove is clicked', async () => {
      const user = userEvent.setup()

      render(
        <AgentManagement
          company={mockCompany}
          agents={[mockAgent]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      // Wait for agent list to appear
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Remove'))

      expect(screen.getByText(/remove agent/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /yes, remove/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('cancels removal when Cancel is clicked', async () => {
      const user = userEvent.setup()

      render(
        <AgentManagement
          company={mockCompany}
          agents={[mockAgent]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Remove'))
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(screen.queryByText(/remove agent.*\?/i)).not.toBeInTheDocument()
      expect(mockApi.deleteAgent).not.toHaveBeenCalled()
    })

    it('calls DELETE API when confirmed', async () => {
      const user = userEvent.setup()

      mockApi.deleteAgent.mockResolvedValue({
        data: { agent_id: 'BA-001', status: 'removed' },
        status: 200,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[mockAgent]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Remove'))
      await user.click(screen.getByRole('button', { name: /yes, remove/i }))

      await waitFor(() => {
        expect(mockApi.deleteAgent).toHaveBeenCalledWith('test-company-id', 'BA-001')
      })
    })

    it('shows success toast after removal', async () => {
      const user = userEvent.setup()

      mockApi.deleteAgent.mockResolvedValue({
        data: { agent_id: 'BA-001', status: 'removed' },
        status: 200,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[mockAgent]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Remove'))
      await user.click(screen.getByRole('button', { name: /yes, remove/i }))

      await waitFor(() => {
        expect(screen.getByText(/agent removed: ba-001/i)).toBeInTheDocument()
      })
    })

    it('refreshes agent list after removal', async () => {
      const user = userEvent.setup()

      mockApi.deleteAgent.mockResolvedValue({
        data: { agent_id: 'BA-001', status: 'removed' },
        status: 200,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[mockAgent]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
      })

      // Initial fetch
      expect(mockApi.getAgents).toHaveBeenCalledTimes(1)

      await user.click(screen.getByText('Remove'))
      await user.click(screen.getByRole('button', { name: /yes, remove/i }))

      // Should refresh after removal
      await waitFor(() => {
        expect(mockApi.getAgents).toHaveBeenCalledTimes(2)
      })
    })
  })

  // Task 5.4: Test role badge colors
  describe('AC4: Agent list display', () => {
    it('displays agent with ID, Name, Role badge, and Status', async () => {
      // The component uses agents prop directly for rendering
      // Set up mock to call onAgentsChange with the agent
      mockApi.getAgents.mockImplementation(() => {
        // Simulate the API call completing and updating agents
        mockOnAgentsChange([mockAgent])
        return Promise.resolve({ data: [mockAgent], status: 200 })
      })

      const { rerender } = render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      // Rerender with updated agents (simulating parent state update)
      rerender(
        <AgentManagement
          company={mockCompany}
          agents={[mockAgent]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
      })
      expect(screen.getByText(/id: ba-001/i)).toBeInTheDocument()
      expect(screen.getByText(/status: idle/i)).toBeInTheDocument()
      // Role badge is a span, dropdown options also have the same text
      const badges = screen.getAllByText('Business Analyst')
      expect(badges.length).toBeGreaterThanOrEqual(1) // At least the badge exists
    })

    it('shows correct agent count in header', async () => {
      const agents: Agent[] = [
        mockAgent,
        { ...mockAgent, id: 'DEV-001', name: 'Bob', role: 'developer' },
      ]

      mockApi.getAgents.mockResolvedValue({
        data: agents,
        status: 200,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={agents}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/company agents \(2\)/i)).toBeInTheDocument()
      })
    })

    it('shows empty state when no agents', async () => {
      mockApi.getAgents.mockResolvedValue({
        data: [],
        status: 200,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/no agents yet/i)).toBeInTheDocument()
      })
    })

    it('applies role color to badge', async () => {
      mockApi.getAgents.mockResolvedValue({
        data: [mockAgent],
        status: 200,
      })

      const { rerender } = render(
        <AgentManagement
          company={mockCompany}
          agents={[]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      // Rerender with agents to simulate parent state update
      rerender(
        <AgentManagement
          company={mockCompany}
          agents={[mockAgent]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await waitFor(() => {
        // Find the badge (span element) not the dropdown option
        const badges = screen.getAllByText('Business Analyst')
        const badge = badges.find(el => el.tagName === 'SPAN')
        expect(badge).toBeDefined()
        expect(badge).toHaveStyle({ backgroundColor: 'rgb(59, 130, 246)' }) // #3B82F6 in rgb
      })
    })

    it('uses fallback color for unknown roles', async () => {
      const customRoleAgent: Agent = {
        ...mockAgent,
        id: 'SEC-001',
        name: 'Charlie',
        role: 'security_engineer',
        role_config: undefined,
      }

      mockApi.getAgents.mockResolvedValue({
        data: [customRoleAgent],
        status: 200,
      })

      render(
        <AgentManagement
          company={mockCompany}
          agents={[customRoleAgent]}
          onAgentsChange={mockOnAgentsChange}
        />
      )

      await waitFor(() => {
        // getRoleDisplayName returns the role itself for unknown roles
        const badge = screen.getByText('security_engineer')
        expect(badge).toHaveStyle({ backgroundColor: getRoleColor('security_engineer') })
      })
    })
  })

  // Helper function tests
  describe('Helper functions', () => {
    it('getRoleColor returns correct colors for default roles', () => {
      expect(getRoleColor('ba')).toBe('#3B82F6')
      expect(getRoleColor('developer')).toBe('#22C55E')
      expect(getRoleColor('qa')).toBe('#EF4444')
    })

    it('getRoleColor returns fallback for unknown roles', () => {
      expect(getRoleColor('unknown_role')).toBe('#6B7280')
    })

    it('getRoleDisplayName returns correct names for default roles', () => {
      expect(getRoleDisplayName('ba')).toBe('Business Analyst')
      expect(getRoleDisplayName('developer')).toBe('Developer')
    })

    it('getRoleDisplayName returns role value for unknown roles', () => {
      expect(getRoleDisplayName('security_engineer')).toBe('security_engineer')
    })
  })
})
