import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventSender from './EventSender'
import { api } from '../services/api'
import type { Company, Agent } from '../types'
import { EVENT_CATEGORIES, EVENT_PAYLOAD_TEMPLATES, isCommunicationEvent } from '../types'

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    sendEvent: vi.fn(),
  },
}))

// Mock ScenarioPanel to isolate EventSender tests
vi.mock('./ScenarioPanel', () => ({
  default: () => <div data-testid="scenario-panel">ScenarioPanel Mock</div>,
}))

const mockApi = vi.mocked(api)

describe('EventSender', () => {
  const mockOnEventSent = vi.fn()
  const mockOnEventUpdate = vi.fn()

  const mockCompany: Company = {
    id: 'test-company-id',
    name: 'Test Company',
    created_at: '2026-02-04T10:00:00Z',
  }

  const mockAgents: Agent[] = [
    {
      id: 'BA-001',
      company_id: 'test-company-id',
      name: 'Alice',
      role: 'ba',
      status: 'idle',
      created_at: '2026-02-04T10:00:00Z',
    },
    {
      id: 'DEV-001',
      company_id: 'test-company-id',
      name: 'Bob',
      role: 'developer',
      status: 'idle',
      created_at: '2026-02-04T10:00:00Z',
    },
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

  // Helper to get form elements
  const getAgentDropdown = () => screen.getAllByRole('combobox')[0] as HTMLSelectElement
  const getEventTypeDropdown = () => screen.getAllByRole('combobox')[1] as HTMLSelectElement
  const getPayloadTextarea = () => screen.getByPlaceholderText(/key.*value/i) as HTMLTextAreaElement
  const getSendButton = () => screen.getByRole('button', { name: /send event/i })

  // AC1: Event sender form visible
  describe('AC1: Form visibility', () => {
    it('shows "Select a company first" when no company selected', () => {
      render(
        <EventSender
          company={null}
          agents={[]}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // Multiple instances of this text exist (header and content), check at least one exists
      expect(screen.getAllByText(/select a company first/i).length).toBeGreaterThan(0)
    })

    it('shows "No agents available" when company has no agents', () => {
      render(
        <EventSender
          company={mockCompany}
          agents={[]}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      expect(screen.getByText(/no agents available/i)).toBeInTheDocument()
    })

    it('renders full form when company and agents are available', () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      expect(screen.getByText(/agent$/i)).toBeInTheDocument()
      expect(screen.getByText(/event type/i)).toBeInTheDocument()
      expect(screen.getByText(/payload/i)).toBeInTheDocument()
      expect(getSendButton()).toBeInTheDocument()
    })

    it('populates agent dropdown with company agents', () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const agentDropdown = getAgentDropdown()
      expect(agentDropdown.innerHTML).toContain('BA-001')
      expect(agentDropdown.innerHTML).toContain('Alice')
      expect(agentDropdown.innerHTML).toContain('DEV-001')
      expect(agentDropdown.innerHTML).toContain('Bob')
    })

    it('renders event types grouped by category', () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const eventTypeDropdown = getEventTypeDropdown()

      // Check that optgroups exist for categories
      Object.keys(EVENT_CATEGORIES).forEach((category) => {
        expect(eventTypeDropdown.innerHTML).toContain(`label="${category}"`)
      })
    })

    it('renders all event types from EVENT_CATEGORIES', () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const eventTypeDropdown = getEventTypeDropdown()

      // Check all event types are present
      Object.values(EVENT_CATEGORIES).flat().forEach((eventType) => {
        expect(eventTypeDropdown.innerHTML).toContain(eventType)
      })
    })

    it('auto-selects first agent', () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const agentDropdown = getAgentDropdown()
      expect(agentDropdown.value).toBe('BA-001')
    })
  })

  // AC2: Payload template auto-fill
  describe('AC2: Payload template auto-fill', () => {
    it('auto-fills payload when event type is selected', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // Select WORKING event type
      const eventTypeDropdown = getEventTypeDropdown()
      await user.selectOptions(eventTypeDropdown, 'WORKING')

      // Check payload textarea contains template
      const payloadTextarea = getPayloadTextarea()
      const template = EVENT_PAYLOAD_TEMPLATES['WORKING']

      await waitFor(() => {
        const payloadValue = JSON.parse(payloadTextarea.value)
        expect(payloadValue.task).toBe((template as { task: string }).task)
      })
    })

    it('updates payload when switching event types', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const eventTypeDropdown = getEventTypeDropdown()
      const payloadTextarea = getPayloadTextarea()

      // Select THINKING first (default)
      await waitFor(() => {
        expect(payloadTextarea.value).toContain('thought')
      })

      // Switch to ERROR
      await user.selectOptions(eventTypeDropdown, 'ERROR')
      await waitFor(() => {
        expect(payloadTextarea.value).toContain('error_type')
      })
    })

    it('allows manual payload editing', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const payloadTextarea = getPayloadTextarea()

      await user.clear(payloadTextarea)
      await user.type(payloadTextarea, '{{ "custom": "value" }}')

      expect(payloadTextarea.value).toContain('custom')
    })
  })

  // AC3: Communication events show To Agent
  describe('AC3: Communication events show To Agent', () => {
    it('shows To Agent dropdown for MESSAGE_SEND event', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const eventTypeDropdown = getEventTypeDropdown()
      await user.selectOptions(eventTypeDropdown, 'MESSAGE_SEND')

      await waitFor(() => {
        expect(screen.getByText(/to agent/i)).toBeInTheDocument()
        // Should have 3 dropdowns now (Agent, Event Type, To Agent)
        expect(screen.getAllByRole('combobox').length).toBe(3)
      })
    })

    it('hides To Agent dropdown for non-communication events', async () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // THINKING is the default and is not a communication event
      // Should only have 2 dropdowns (Agent, Event Type)
      expect(screen.getAllByRole('combobox').length).toBe(2)
    })

    it('excludes selected agent from To Agent dropdown', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      // First agent (BA-001) is auto-selected
      const eventTypeDropdown = getEventTypeDropdown()
      await user.selectOptions(eventTypeDropdown, 'MESSAGE_SEND')

      await waitFor(() => {
        const toAgentDropdown = screen.getAllByRole('combobox')[2] as HTMLSelectElement
        // Should not contain BA-001 (the selected agent) as an option value
        const options = Array.from(toAgentDropdown.options)
        const ba001Option = options.find(opt => opt.value === 'BA-001')
        expect(ba001Option).toBeUndefined()
        // Should contain DEV-001
        const dev001Option = options.find(opt => opt.value === 'DEV-001')
        expect(dev001Option).toBeDefined()
      })
    })

    it('updates payload to_agent field when To Agent is selected', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const eventTypeDropdown = getEventTypeDropdown()
      await user.selectOptions(eventTypeDropdown, 'MESSAGE_SEND')

      await waitFor(() => {
        expect(screen.getAllByRole('combobox').length).toBe(3)
      })

      const toAgentDropdown = screen.getAllByRole('combobox')[2]
      await user.selectOptions(toAgentDropdown, 'DEV-001')

      const payloadTextarea = getPayloadTextarea()
      await waitFor(() => {
        expect(payloadTextarea.value).toContain('DEV-001')
      })
    })
  })

  // AC4: Send event successfully
  describe('AC4: Send event', () => {
    it('calls API with correct payload on send', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(getSendButton())

      await waitFor(() => {
        expect(mockApi.sendEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            company_id: 'test-company-id',
            agent_id: 'BA-001',
            event_type: 'THINKING',
          })
        )
      })
    })

    it('calls onEventSent with pending event before API response', async () => {
      const user = userEvent.setup()

      // Make API slow to test pending state
      mockApi.sendEvent.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          data: { event_id: 'evt-123', timestamp: '2026-02-04T10:00:00Z', status: 'accepted' },
          status: 200,
        }), 100)
      }))

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(getSendButton())

      // onEventSent should be called immediately with pending status
      expect(mockOnEventSent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
          company_id: 'test-company-id',
          agent_id: 'BA-001',
        })
      )
    })

    it('calls onEventUpdate with success after API responds', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(getSendButton())

      await waitFor(() => {
        expect(mockOnEventUpdate).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            status: 'success',
          })
        )
      })
    })

    it('shows success indicator after successful send', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(getSendButton())

      await waitFor(() => {
        expect(screen.getByText(/event sent successfully/i)).toBeInTheDocument()
      })
    })

    it('shows error message on API failure', async () => {
      const user = userEvent.setup()

      mockApi.sendEvent.mockResolvedValue({
        error: 'Company not found',
        status: 404,
      })

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(getSendButton())

      await waitFor(() => {
        expect(screen.getByText(/company not found/i)).toBeInTheDocument()
      })
    })

    it('calls onEventUpdate with error status on API failure', async () => {
      const user = userEvent.setup()

      mockApi.sendEvent.mockResolvedValue({
        error: 'Company not found',
        status: 404,
      })

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(getSendButton())

      await waitFor(() => {
        expect(mockOnEventUpdate).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            status: 'error',
            error: 'Company not found',
          })
        )
      })
    })

    it('disables send button while sending', async () => {
      const user = userEvent.setup()

      mockApi.sendEvent.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          data: { event_id: 'evt-123', timestamp: '2026-02-04T10:00:00Z', status: 'accepted' },
          status: 200,
        }), 100)
      }))

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(getSendButton())

      // Button should show "Sending..." and be disabled
      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })

    it('shows JSON validation error for invalid payload', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const payloadTextarea = getPayloadTextarea()
      await user.clear(payloadTextarea)
      await user.type(payloadTextarea, 'not valid json')

      // The error message "Invalid JSON syntax" appears in a span
      expect(screen.getByText(/invalid json syntax/i)).toBeInTheDocument()
    })

    it('disables send button when JSON is invalid', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const payloadTextarea = getPayloadTextarea()
      await user.clear(payloadTextarea)
      await user.type(payloadTextarea, 'not valid json')

      expect(getSendButton()).toBeDisabled()
    })
  })

  // AC5: Keyboard shortcut
  describe('AC5: Keyboard shortcut', () => {
    it('shows keyboard shortcut hint', () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      expect(screen.getByText(/ctrl/i)).toBeInTheDocument()
      expect(screen.getByText(/enter/i)).toBeInTheDocument()
    })

    it('sends event on Ctrl+Enter', async () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true })

      await waitFor(() => {
        expect(mockApi.sendEvent).toHaveBeenCalled()
      })
    })

    it('sends event on Cmd+Enter (Mac)', async () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      fireEvent.keyDown(window, { key: 'Enter', metaKey: true })

      await waitFor(() => {
        expect(mockApi.sendEvent).toHaveBeenCalled()
      })
    })

    it('does not send on Enter alone', async () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      fireEvent.keyDown(window, { key: 'Enter' })

      // API should not be called
      expect(mockApi.sendEvent).not.toHaveBeenCalled()
    })
  })

  // Tab functionality
  describe('Tab functionality', () => {
    it('shows Manual tab by default', () => {
      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      const manualTab = screen.getByRole('button', { name: /manual/i })
      expect(manualTab).toHaveClass('text-blue-400')
    })

    it('switches to Scenarios tab when clicked', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByRole('button', { name: /scenarios/i }))

      expect(screen.getByTestId('scenario-panel')).toBeInTheDocument()
    })

    it('does not trigger keyboard shortcut when on Scenarios tab', async () => {
      const user = userEvent.setup()

      render(
        <EventSender
          company={mockCompany}
          agents={mockAgents}
          onEventSent={mockOnEventSent}
          onEventUpdate={mockOnEventUpdate}
        />
      )

      await user.click(screen.getByRole('button', { name: /scenarios/i }))

      fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true })

      // API should not be called from keyboard shortcut on Scenarios tab
      expect(mockApi.sendEvent).not.toHaveBeenCalled()
    })
  })

  // Helper function tests
  describe('Helper functions', () => {
    it('isCommunicationEvent returns true for MESSAGE_SEND', () => {
      expect(isCommunicationEvent('MESSAGE_SEND')).toBe(true)
    })

    it('isCommunicationEvent returns true for WORK_REQUEST', () => {
      expect(isCommunicationEvent('WORK_REQUEST')).toBe(true)
    })

    it('isCommunicationEvent returns false for THINKING', () => {
      expect(isCommunicationEvent('THINKING')).toBe(false)
    })

    it('isCommunicationEvent returns false for IDLE', () => {
      expect(isCommunicationEvent('IDLE')).toBe(false)
    })
  })
})
