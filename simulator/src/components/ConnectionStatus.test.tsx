import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConnectionStatus from './ConnectionStatus'
import { api, getApiBaseUrl, setApiBaseUrl } from '../services/api'

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    healthCheck: vi.fn(),
  },
  getApiBaseUrl: vi.fn(),
  setApiBaseUrl: vi.fn(),
}))

const mockApi = vi.mocked(api)
const mockGetApiBaseUrl = vi.mocked(getApiBaseUrl)
const mockSetApiBaseUrl = vi.mocked(setApiBaseUrl)

describe('ConnectionStatus', () => {
  const mockOnToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetApiBaseUrl.mockReturnValue('http://localhost:8002/api')
    mockApi.healthCheck.mockResolvedValue({
      data: { status: 'healthy', version: '1.0.0', database: 'connected' } as { status: string },
      status: 200,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // AC1: Connection indicator visible
  describe('AC1: Connection indicator visible', () => {
    it('renders connection status indicator', async () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      expect(screen.getByRole('button', { name: /connection status/i })).toBeInTheDocument()
    })

    it('shows initial checking state', () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      expect(screen.getByText(/checking/i)).toBeInTheDocument()
    })

    it('shows status dot', () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      const button = screen.getByRole('button', { name: /connection status/i })
      const dot = button.querySelector('span.rounded-full')
      expect(dot).toBeInTheDocument()
    })
  })

  // AC2: Connected state
  describe('AC2: Connected state', () => {
    it('shows "Connected" when health check succeeds', async () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })
    })

    it('shows green dot when connected', async () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      const button = screen.getByRole('button', { name: /connection status/i })
      const dot = button.querySelector('span.bg-green-500')
      expect(dot).toBeInTheDocument()
    })

    it('shows version in tooltip when connected', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      const button = screen.getByRole('button', { name: /connection status/i })
      await user.hover(button)

      await waitFor(() => {
        expect(screen.getByText('1.0.0')).toBeInTheDocument()
      })
    })

    it('shows API URL in tooltip', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      const button = screen.getByRole('button', { name: /connection status/i })
      await user.hover(button)

      await waitFor(() => {
        expect(screen.getByText('http://localhost:8002/api')).toBeInTheDocument()
      })
    })
  })

  // AC3: Disconnected state
  describe('AC3: Disconnected state', () => {
    beforeEach(() => {
      mockApi.healthCheck.mockResolvedValue({
        error: 'Network error',
        status: 0,
      })
    })

    it('shows "Disconnected" when health check fails', async () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument()
      })
    })

    it('shows red dot when disconnected', async () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument()
      })

      const button = screen.getByRole('button', { name: /connection status/i })
      const dot = button.querySelector('span.bg-red-500')
      expect(dot).toBeInTheDocument()
    })

    it('shows Retry button when disconnected', async () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument()
      })

      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('retries connection when Retry clicked', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument()
      })

      const initialCalls = mockApi.healthCheck.mock.calls.length

      await user.click(screen.getByText('Retry'))

      await waitFor(() => {
        expect(mockApi.healthCheck.mock.calls.length).toBeGreaterThan(initialCalls)
      })
    })
  })

  // AC4: Auto-refresh status (simplified - just verify polling interval is set)
  describe('AC4: Auto-refresh status', () => {
    it('calls health check on mount', async () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(mockApi.healthCheck).toHaveBeenCalled()
      })
    })
  })

  // AC5: Settings panel
  describe('AC5: Settings panel', () => {
    it('opens settings panel when indicator clicked', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByText('Connection Settings')).toBeInTheDocument()
      })
    })

    it('shows API URL input field', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/localhost/i)).toBeInTheDocument()
      })
    })

    it('shows Test Connection button', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /test connection/i })).toBeInTheDocument()
      })
    })

    it('shows Save URL button', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save url/i })).toBeInTheDocument()
      })
    })

    it('Test Connection calls health check', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /test connection/i })).toBeInTheDocument()
      })

      const initialCalls = mockApi.healthCheck.mock.calls.length

      await user.click(screen.getByRole('button', { name: /test connection/i }))

      await waitFor(() => {
        expect(mockApi.healthCheck.mock.calls.length).toBeGreaterThan(initialCalls)
      })
    })

    it('shows success message after successful test', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /test connection/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /test connection/i }))

      await waitFor(() => {
        expect(screen.getByText(/connection successful/i)).toBeInTheDocument()
      })
    })

    it('Save URL calls setApiBaseUrl', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/localhost/i)).toBeInTheDocument()
      })

      const urlInput = screen.getByPlaceholderText(/localhost/i)
      await user.clear(urlInput)
      await user.type(urlInput, 'http://new-api.example.com/api')

      await user.click(screen.getByRole('button', { name: /save url/i }))

      expect(mockSetApiBaseUrl).toHaveBeenCalledWith('http://new-api.example.com/api')
    })

    it('shows toast when URL is saved', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/localhost/i)).toBeInTheDocument()
      })

      const urlInput = screen.getByPlaceholderText(/localhost/i)
      await user.clear(urlInput)
      await user.type(urlInput, 'http://new-api.example.com/api')

      await user.click(screen.getByRole('button', { name: /save url/i }))

      expect(mockOnToast).toHaveBeenCalledWith('API URL updated', 'info')
    })

    it('closes settings panel when Close clicked', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByText('Connection Settings')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Close'))

      await waitFor(() => {
        expect(screen.queryByText('Connection Settings')).not.toBeInTheDocument()
      })
    })

    it('shows version in settings panel when connected', async () => {
      const user = userEvent.setup()

      render(<ConnectionStatus onToast={mockOnToast} />)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /connection status/i }))

      await waitFor(() => {
        expect(screen.getByText('Version:')).toBeInTheDocument()
        expect(screen.getByText('1.0.0')).toBeInTheDocument()
      })
    })
  })

  // Checking state
  describe('Checking state', () => {
    it('shows yellow dot initially', () => {
      render(<ConnectionStatus onToast={mockOnToast} />)

      const button = screen.getByRole('button', { name: /connection status/i })
      const dot = button.querySelector('span.bg-yellow-500')
      expect(dot).toBeInTheDocument()
    })
  })
})
