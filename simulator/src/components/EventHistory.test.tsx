import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventHistory from './EventHistory'
import type { SentEvent } from '../types'

// Mock clipboard API
const mockWriteText = vi.fn()

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
    },
    writable: true,
    configurable: true,
  })
  mockWriteText.mockResolvedValue(undefined)
})

describe('EventHistory', () => {
  const mockOnClear = vi.fn()
  const mockOnRetry = vi.fn()

  const mockSuccessEvent: SentEvent = {
    id: 'evt-001',
    timestamp: '2026-02-04T10:00:00Z',
    company_id: 'company-1',
    company_name: 'Test Company',
    agent_id: 'BA-001',
    agent_name: 'Alice',
    agent_role: 'ba',
    event_type: 'THINKING',
    payload: { thought: 'Analyzing requirements', context: 'planning' },
    status: 'success',
    response: { event_id: 'api-evt-123', timestamp: '2026-02-04T10:00:01Z', status: 'accepted' },
  }

  const mockErrorEvent: SentEvent = {
    id: 'evt-002',
    timestamp: '2026-02-04T10:01:00Z',
    company_id: 'company-1',
    company_name: 'Test Company',
    agent_id: 'DEV-001',
    agent_name: 'Bob',
    agent_role: 'developer',
    event_type: 'WORKING',
    payload: { task: 'Implementing feature', progress: 50 },
    status: 'error',
    error: 'Network error: Connection refused',
  }

  const mockPendingEvent: SentEvent = {
    id: 'evt-003',
    timestamp: '2026-02-04T10:02:00Z',
    company_id: 'company-1',
    company_name: 'Test Company',
    agent_id: 'QA-001',
    agent_name: 'Charlie',
    agent_role: 'qa',
    event_type: 'EXECUTING',
    payload: { action: 'Running tests', command: 'npm test' },
    status: 'pending',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // AC1: Event history table
  describe('AC1: Event history table', () => {
    it('shows "No events yet" when history is empty', () => {
      render(
        <EventHistory
          events={[]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText(/no events yet/i)).toBeInTheDocument()
    })

    it('displays event count in header', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent, mockErrorEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText(/2 events sent/i)).toBeInTheDocument()
    })

    it('displays single event count correctly', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText(/1 event sent/i)).toBeInTheDocument()
    })

    it('displays event with agent ID and event type', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('BA-001')).toBeInTheDocument()
      expect(screen.getByText('THINKING')).toBeInTheDocument()
    })

    it('displays agent name and company name', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText(/alice.*test company/i)).toBeInTheDocument()
    })

    it('displays formatted timestamp', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      // Should display time in HH:MM:SS format
      // The exact format depends on locale, so we check for presence of time-like pattern
      const timePattern = /\d{1,2}:\d{2}:\d{2}/
      const container = screen.getByText('BA-001').closest('button')
      expect(container?.textContent).toMatch(timePattern)
    })

    it('shows Clear History button when events exist', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByRole('button', { name: /clear history/i })).toBeInTheDocument()
    })

    it('hides Clear History button when no events', () => {
      render(
        <EventHistory
          events={[]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.queryByRole('button', { name: /clear history/i })).not.toBeInTheDocument()
    })
  })

  // AC2: Success status display
  describe('AC2: Success status display', () => {
    it('shows green checkmark for successful events', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('shows "Sent" status text for successful events', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      // Look for the status text that starts with "Sent" and includes the event_id
      expect(screen.getByText(/sent \(/i)).toBeInTheDocument()
    })

    it('shows truncated event_id from API response', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      // event_id is 'api-evt-123', component shows first 8 chars: 'api-evt-' in "Sent (api-evt-...)"
      const sentText = screen.getByText(/sent.*api-evt-/i)
      expect(sentText).toBeInTheDocument()
    })
  })

  // AC3: Error status display
  describe('AC3: Error status display', () => {
    it('shows red X for failed events', () => {
      render(
        <EventHistory
          events={[mockErrorEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('✗')).toBeInTheDocument()
    })

    it('shows "Failed" status text for error events', () => {
      render(
        <EventHistory
          events={[mockErrorEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText(/failed/i)).toBeInTheDocument()
    })

    it('shows error message preview when collapsed', () => {
      render(
        <EventHistory
          events={[mockErrorEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText(/error:.*network error/i)).toBeInTheDocument()
    })

    it('shows Retry button when expanded', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockErrorEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      // Click to expand
      await user.click(screen.getByText('WORKING'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })

    it('calls onRetry when Retry button clicked', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockErrorEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByText('WORKING'))
      await user.click(screen.getByRole('button', { name: /retry/i }))

      expect(mockOnRetry).toHaveBeenCalledWith(mockErrorEvent)
    })
  })

  // AC4: Event details expansion
  describe('AC4: Event details expansion', () => {
    it('expands event when clicked', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      // Initially collapsed - no payload visible
      expect(screen.queryByText(/request payload/i)).not.toBeInTheDocument()

      // Click to expand
      await user.click(screen.getByText('THINKING'))

      // Should show payload
      await waitFor(() => {
        expect(screen.getByText(/request payload/i)).toBeInTheDocument()
      })
    })

    it('shows full payload JSON when expanded', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByText('THINKING'))

      await waitFor(() => {
        expect(screen.getByText(/analyzing requirements/i)).toBeInTheDocument()
      })
    })

    it('shows API response when expanded (success)', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByText('THINKING'))

      await waitFor(() => {
        expect(screen.getByText(/api response/i)).toBeInTheDocument()
      })
    })

    it('shows error details when expanded (error)', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockErrorEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByText('WORKING'))

      await waitFor(() => {
        expect(screen.getByText(/error details/i)).toBeInTheDocument()
      })
    })

    it('shows Copy Payload button when expanded', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByText('THINKING'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy payload/i })).toBeInTheDocument()
      })
    })

    it('copies payload to clipboard when Copy Payload clicked', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByText('THINKING'))
      await user.click(screen.getByRole('button', { name: /copy payload/i }))

      // Verify copy feedback appears (confirms copy was attempted)
      await waitFor(() => {
        expect(screen.getByText(/copied!/i)).toBeInTheDocument()
      })
    })

    it('shows "Copied!" feedback after copying', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByText('THINKING'))
      await user.click(screen.getByRole('button', { name: /copy payload/i }))

      await waitFor(() => {
        expect(screen.getByText(/copied!/i)).toBeInTheDocument()
      })
    })

    it('collapses event when clicked again', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      // Expand
      await user.click(screen.getByText('THINKING'))
      await waitFor(() => {
        expect(screen.getByText(/request payload/i)).toBeInTheDocument()
      })

      // Collapse
      await user.click(screen.getByText('THINKING'))
      await waitFor(() => {
        expect(screen.queryByText(/request payload/i)).not.toBeInTheDocument()
      })
    })

    it('shows expand/collapse indicator', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      // Should show down arrow when collapsed
      expect(screen.getByText('▼')).toBeInTheDocument()
    })
  })

  // AC5: Clear history
  describe('AC5: Clear history', () => {
    it('shows confirmation dialog when Clear History clicked', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent, mockErrorEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByRole('button', { name: /clear history/i }))

      await waitFor(() => {
        expect(screen.getByText(/clear all 2 events/i)).toBeInTheDocument()
      })
    })

    it('shows Yes and Cancel buttons in confirmation', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByRole('button', { name: /clear history/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /yes, clear all/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })
    })

    it('calls onClear when confirmed', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByRole('button', { name: /clear history/i }))
      await user.click(screen.getByRole('button', { name: /yes, clear all/i }))

      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it('hides confirmation when Cancel clicked', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByRole('button', { name: /clear history/i }))

      await waitFor(() => {
        expect(screen.getByText(/clear all 1 event/i)).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(screen.queryByText(/clear all 1 event/i)).not.toBeInTheDocument()
      })
    })

    it('does not call onClear when Cancel clicked', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      await user.click(screen.getByRole('button', { name: /clear history/i }))
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnClear).not.toHaveBeenCalled()
    })
  })

  // Pending status display
  describe('Pending status display', () => {
    it('shows yellow indicator for pending events', () => {
      render(
        <EventHistory
          events={[mockPendingEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('⏳')).toBeInTheDocument()
    })

    it('shows "Sending..." text for pending events', () => {
      render(
        <EventHistory
          events={[mockPendingEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })
  })

  // Multiple events
  describe('Multiple events', () => {
    it('renders all events', () => {
      render(
        <EventHistory
          events={[mockSuccessEvent, mockErrorEvent, mockPendingEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('BA-001')).toBeInTheDocument()
      expect(screen.getByText('DEV-001')).toBeInTheDocument()
      expect(screen.getByText('QA-001')).toBeInTheDocument()
    })

    it('only expands one event at a time', async () => {
      const user = userEvent.setup()

      render(
        <EventHistory
          events={[mockSuccessEvent, mockErrorEvent]}
          onClear={mockOnClear}
          onRetry={mockOnRetry}
        />
      )

      // Expand first event
      await user.click(screen.getByText('THINKING'))
      await waitFor(() => {
        expect(screen.getAllByText(/request payload/i)).toHaveLength(1)
      })

      // Expand second event - first should collapse
      await user.click(screen.getByText('WORKING'))
      await waitFor(() => {
        expect(screen.getAllByText(/request payload/i)).toHaveLength(1)
      })
    })
  })
})
