import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScenarioPanel from './ScenarioPanel'
import { api } from '../services/api'
import type { Company, Agent } from '../types'
import { SCENARIOS, canRunScenario, getMissingRoles, findAgentByRole } from '../data/scenarios'

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    sendEvent: vi.fn(),
  },
}))

const mockApi = vi.mocked(api)

describe('ScenarioPanel', () => {
  const mockOnEventSent = vi.fn()
  const mockOnEventUpdate = vi.fn()

  const mockCompany: Company = {
    id: 'test-company-id',
    name: 'Test Company',
    created_at: '2026-02-04T10:00:00Z',
  }

  // Full set of agents for all roles
  const mockAgentsFullSet: Agent[] = [
    { id: 'CUST-001', company_id: 'test-company-id', name: 'Customer', role: 'customer', status: 'idle', created_at: '2026-02-04T10:00:00Z' },
    { id: 'BA-001', company_id: 'test-company-id', name: 'Alice', role: 'ba', status: 'idle', created_at: '2026-02-04T10:00:00Z' },
    { id: 'PM-001', company_id: 'test-company-id', name: 'Bob', role: 'pm', status: 'idle', created_at: '2026-02-04T10:00:00Z' },
    { id: 'ARCH-001', company_id: 'test-company-id', name: 'Charlie', role: 'architect', status: 'idle', created_at: '2026-02-04T10:00:00Z' },
    { id: 'DEV-001', company_id: 'test-company-id', name: 'David', role: 'developer', status: 'idle', created_at: '2026-02-04T10:00:00Z' },
    { id: 'QA-001', company_id: 'test-company-id', name: 'Eve', role: 'qa', status: 'idle', created_at: '2026-02-04T10:00:00Z' },
  ]

  // Minimal agents (only BA and Developer)
  const mockAgentsMinimal: Agent[] = [
    { id: 'BA-001', company_id: 'test-company-id', name: 'Alice', role: 'ba', status: 'idle', created_at: '2026-02-04T10:00:00Z' },
    { id: 'DEV-001', company_id: 'test-company-id', name: 'David', role: 'developer', status: 'idle', created_at: '2026-02-04T10:00:00Z' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.sendEvent.mockResolvedValue({
      data: { event_id: 'evt-123', timestamp: '2026-02-04T10:00:00Z', status: 'accepted' },
      status: 200,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // AC1: Scenarios tab visible
  describe('AC1: Scenarios list visibility', () => {
    it('shows "Select a company first" when no company selected', () => {
      render(
        <ScenarioPanel
          company={null}
          agents={[]}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      expect(screen.getByText(/select a company first/i)).toBeInTheDocument()
    })

    it('shows "Add agents first" when company has no agents', () => {
      render(
        <ScenarioPanel
          company={mockCompany}
          agents={[]}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      expect(screen.getByText(/add agents first/i)).toBeInTheDocument()
    })

    it('renders all predefined scenarios when company and agents exist', () => {
      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsFullSet}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // Check all 5 scenarios are listed
      expect(screen.getByText('Quick Demo')).toBeInTheDocument()
      expect(screen.getByText('Full SDLC Cycle')).toBeInTheDocument()
      expect(screen.getByText('Multi-Agent Collaboration')).toBeInTheDocument()
      expect(screen.getByText('Stress Test')).toBeInTheDocument()
      expect(screen.getByText('All Event Types')).toBeInTheDocument()
    })

    it('shows scenario duration and event count', () => {
      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsFullSet}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // Quick Demo has 5 events, 30 seconds
      expect(screen.getByText('30 seconds')).toBeInTheDocument()
      expect(screen.getByText('5 events')).toBeInTheDocument()
    })

    it('shows "Ready to run" for scenarios with all required roles', () => {
      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsFullSet}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // All scenarios should show "Ready to run" with full agent set
      const readyLabels = screen.getAllByText(/ready to run/i)
      expect(readyLabels.length).toBe(SCENARIOS.length)
    })

    it('shows missing roles warning for scenarios missing required agents', () => {
      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // Full SDLC requires customer, ba, pm, architect, developer, qa
      // With only ba and developer, should show missing roles
      expect(screen.getAllByText(/missing:/i).length).toBeGreaterThan(0)
    })
  })

  // AC2: Scenario info panel
  describe('AC2: Scenario info panel', () => {
    it('shows scenario details when scenario is selected', async () => {
      const user = userEvent.setup()

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // Click on Quick Demo (requires ba and developer - both available)
      await user.click(screen.getByText('Quick Demo'))

      // Should show scenario info panel
      await waitFor(() => {
        expect(screen.getByText(/ba analyzes.*developer implements/i)).toBeInTheDocument()
      })
    })

    it('shows estimated duration in info panel', async () => {
      const user = userEvent.setup()

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Quick Demo'))

      await waitFor(() => {
        expect(screen.getByText(/⏱ 30 seconds/)).toBeInTheDocument()
      })
    })

    it('shows event count in info panel', async () => {
      const user = userEvent.setup()

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Quick Demo'))

      await waitFor(() => {
        expect(screen.getByText(/📝 5 events/)).toBeInTheDocument()
      })
    })

    it('shows required roles with availability indicators', async () => {
      const user = userEvent.setup()

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Quick Demo'))

      await waitFor(() => {
        expect(screen.getByText(/required roles:/i)).toBeInTheDocument()
        // BA and Developer should be shown as available (green)
        expect(screen.getByText('Business Analyst')).toBeInTheDocument()
        expect(screen.getByText('Developer')).toBeInTheDocument()
      })
    })

    it('shows Start button when scenario is ready', async () => {
      const user = userEvent.setup()

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Quick Demo'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start scenario/i })).toBeInTheDocument()
      })
    })

    it('shows Back to list button', async () => {
      const user = userEvent.setup()

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Quick Demo'))

      await waitFor(() => {
        expect(screen.getByText(/back to list/i)).toBeInTheDocument()
      })
    })

    it('returns to list when Back is clicked', async () => {
      const user = userEvent.setup()

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Quick Demo'))

      await waitFor(() => {
        expect(screen.getByText(/back to list/i)).toBeInTheDocument()
      })

      await user.click(screen.getByText(/back to list/i))

      // Should be back to list view
      await waitFor(() => {
        expect(screen.getByText('Full SDLC Cycle')).toBeInTheDocument()
      })
    })

    it('disables Start button when missing required roles', async () => {
      const user = userEvent.setup()

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // Click on Full SDLC which requires all 6 roles
      await user.click(screen.getByText('Full SDLC Cycle'))

      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /start scenario/i })
        expect(startButton).toBeDisabled()
      })
    })

    it('shows missing roles warning in info panel', async () => {
      const user = userEvent.setup()

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Full SDLC Cycle'))

      await waitFor(() => {
        expect(screen.getByText(/missing agents for roles:/i)).toBeInTheDocument()
      })
    })
  })

  // AC3: Scenario execution
  describe('AC3: Scenario execution', () => {
    it('shows Pause and Stop buttons when running', async () => {
      const user = userEvent.setup()

      // Make API slow to keep scenario running
      mockApi.sendEvent.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          data: { event_id: 'evt-123', timestamp: '2026-02-04T10:00:00Z', status: 'accepted' },
          status: 200,
        }), 50)
      }))

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Quick Demo'))
      await user.click(screen.getByRole('button', { name: /start scenario/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })
    })

    it('shows progress bar when running', async () => {
      const user = userEvent.setup()

      mockApi.sendEvent.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          data: { event_id: 'evt-123', timestamp: '2026-02-04T10:00:00Z', status: 'accepted' },
          status: 200,
        }), 50)
      }))

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Quick Demo'))
      await user.click(screen.getByRole('button', { name: /start scenario/i }))

      await waitFor(() => {
        expect(screen.getByText(/progress/i)).toBeInTheDocument()
      })
    })

    it('calls onEventSent for each event', async () => {
      const user = userEvent.setup()

      // Fast mock to complete quickly
      mockApi.sendEvent.mockResolvedValue({
        data: { event_id: 'evt-123', timestamp: '2026-02-04T10:00:00Z', status: 'accepted' },
        status: 200,
      })

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // Use Stress Test - it's fast (15 seconds with short delays)
      await user.click(screen.getByText('Stress Test'))
      await user.click(screen.getByRole('button', { name: /start scenario/i }))

      // Wait for events to be sent
      await waitFor(() => {
        expect(mockOnEventSent).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('stops scenario when Stop is clicked', async () => {
      const user = userEvent.setup()

      mockApi.sendEvent.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          data: { event_id: 'evt-123', timestamp: '2026-02-04T10:00:00Z', status: 'accepted' },
          status: 200,
        }), 100)
      }))

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Quick Demo'))
      await user.click(screen.getByRole('button', { name: /start scenario/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /stop/i }))

      // Should return to idle state with Start button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start scenario/i })).toBeInTheDocument()
      })
    })
  })

  // AC4: Scenario completion
  describe('AC4: Scenario completion', () => {
    it('shows completion message when scenario finishes', async () => {
      const user = userEvent.setup()

      // Use Stress Test with instant responses
      mockApi.sendEvent.mockResolvedValue({
        data: { event_id: 'evt-123', timestamp: '2026-02-04T10:00:00Z', status: 'accepted' },
        status: 200,
      })

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // Stress Test only needs developer role and has short delays
      await user.click(screen.getByText('Stress Test'))
      await user.click(screen.getByRole('button', { name: /start scenario/i }))

      // Wait for completion (stress test is ~7 seconds of delays)
      await waitFor(() => {
        expect(screen.getByText(/scenario complete:/i)).toBeInTheDocument()
      }, { timeout: 15000 })
    }, 20000)

    it('shows Run Again button after completion', async () => {
      const user = userEvent.setup()

      mockApi.sendEvent.mockResolvedValue({
        data: { event_id: 'evt-123', timestamp: '2026-02-04T10:00:00Z', status: 'accepted' },
        status: 200,
      })

      render(
        <ScenarioPanel
          company={mockCompany}
          agents={mockAgentsMinimal}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByText('Stress Test'))
      await user.click(screen.getByRole('button', { name: /start scenario/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /run again/i })).toBeInTheDocument()
      }, { timeout: 15000 })
    }, 20000)
  })

  // Helper function tests
  describe('Helper functions', () => {
    it('canRunScenario returns true when all roles available', () => {
      const quickDemo = SCENARIOS.find(s => s.id === 'quick-demo')!
      expect(canRunScenario(quickDemo, mockAgentsMinimal)).toBe(true)
    })

    it('canRunScenario returns false when roles missing', () => {
      const fullSdlc = SCENARIOS.find(s => s.id === 'full-sdlc')!
      expect(canRunScenario(fullSdlc, mockAgentsMinimal)).toBe(false)
    })

    it('getMissingRoles returns missing role names', () => {
      const fullSdlc = SCENARIOS.find(s => s.id === 'full-sdlc')!
      const missing = getMissingRoles(fullSdlc, mockAgentsMinimal)
      expect(missing).toContain('customer')
      expect(missing).toContain('pm')
      expect(missing).toContain('architect')
      expect(missing).toContain('qa')
      expect(missing).not.toContain('ba')
      expect(missing).not.toContain('developer')
    })

    it('findAgentByRole returns correct agent', () => {
      const baAgent = findAgentByRole(mockAgentsMinimal, 'ba')
      expect(baAgent?.id).toBe('BA-001')
      expect(baAgent?.name).toBe('Alice')
    })

    it('findAgentByRole returns undefined for missing role', () => {
      const qaAgent = findAgentByRole(mockAgentsMinimal, 'qa')
      expect(qaAgent).toBeUndefined()
    })
  })

  // SCENARIOS data tests
  describe('SCENARIOS data', () => {
    it('has exactly 5 predefined scenarios', () => {
      expect(SCENARIOS.length).toBe(5)
    })

    it('Quick Demo has correct structure', () => {
      const quickDemo = SCENARIOS.find(s => s.id === 'quick-demo')!
      expect(quickDemo.name).toBe('Quick Demo')
      expect(quickDemo.events.length).toBe(5)
      expect(quickDemo.requiredRoles).toContain('ba')
      expect(quickDemo.requiredRoles).toContain('developer')
    })

    it('Full SDLC Cycle requires all 6 roles', () => {
      const fullSdlc = SCENARIOS.find(s => s.id === 'full-sdlc')!
      expect(fullSdlc.requiredRoles).toHaveLength(6)
      expect(fullSdlc.requiredRoles).toContain('customer')
      expect(fullSdlc.requiredRoles).toContain('ba')
      expect(fullSdlc.requiredRoles).toContain('pm')
      expect(fullSdlc.requiredRoles).toContain('architect')
      expect(fullSdlc.requiredRoles).toContain('developer')
      expect(fullSdlc.requiredRoles).toContain('qa')
    })

    it('Stress Test only requires developer', () => {
      const stressTest = SCENARIOS.find(s => s.id === 'stress-test')!
      expect(stressTest.requiredRoles).toHaveLength(1)
      expect(stressTest.requiredRoles).toContain('developer')
    })

    it('All scenarios have valid event types', () => {
      SCENARIOS.forEach(scenario => {
        scenario.events.forEach(event => {
          expect(event.eventType).toBeDefined()
          expect(event.agentRole).toBeDefined()
          expect(event.delayMs).toBeGreaterThanOrEqual(0)
        })
      })
    })
  })
})
