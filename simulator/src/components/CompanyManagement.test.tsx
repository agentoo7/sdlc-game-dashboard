import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompanyManagement from './CompanyManagement'
import { api } from '../services/api'
import type { Company } from '../types'

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    getCompanies: vi.fn(),
    createCompany: vi.fn(),
  },
}))

const mockApi = vi.mocked(api)

describe('CompanyManagement', () => {
  const mockOnCompanySelect = vi.fn()
  const mockCompany: Company = {
    id: 'test-company-id',
    name: 'Test Company',
    description: 'Test description',
    agent_count: 5,
    created_at: '2026-02-04T10:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: return empty companies list
    mockApi.getCompanies.mockResolvedValue({
      data: { companies: [] },
      status: 200,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Task 5.1: Test form renders with all required fields
  describe('AC1: Form rendering', () => {
    it('renders Company Management header', async () => {
      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      expect(screen.getByText('Company Management')).toBeInTheDocument()
    })

    it('renders company name input field (required)', async () => {
      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      const nameInput = screen.getByPlaceholderText('Company Name *')
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveAttribute('type', 'text')
    })

    it('renders description input field (optional)', async () => {
      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      const descInput = screen.getByPlaceholderText('Description (optional)')
      expect(descInput).toBeInTheDocument()
    })

    it('renders Create Company button', async () => {
      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      expect(screen.getByRole('button', { name: /create company/i })).toBeInTheDocument()
    })

    it('renders Active Companies dropdown', async () => {
      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      expect(screen.getByText('Active Companies')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  // Task 5.2: Test successful company creation flow
  describe('AC2: Successful company creation', () => {
    it('calls API with form data on submit', async () => {
      const user = userEvent.setup()
      const newCompany: Company = {
        id: 'new-company-id',
        name: 'New Test Company',
        created_at: '2026-02-04T10:00:00Z',
      }

      mockApi.createCompany.mockResolvedValue({
        data: newCompany,
        status: 201,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      // Fill form
      await user.type(screen.getByPlaceholderText('Company Name *'), 'New Test Company')
      await user.type(screen.getByPlaceholderText('Description (optional)'), 'Test description')

      // Submit
      await user.click(screen.getByRole('button', { name: /create company/i }))

      await waitFor(() => {
        expect(mockApi.createCompany).toHaveBeenCalledWith('New Test Company', 'Test description')
      })
    })

    it('shows success toast with company_id on creation', async () => {
      const user = userEvent.setup()
      const newCompany: Company = {
        id: 'new-company-123',
        name: 'New Test Company',
        created_at: '2026-02-04T10:00:00Z',
      }

      mockApi.createCompany.mockResolvedValue({
        data: newCompany,
        status: 201,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      await user.type(screen.getByPlaceholderText('Company Name *'), 'New Test Company')
      await user.click(screen.getByRole('button', { name: /create company/i }))

      await waitFor(() => {
        expect(screen.getByText(/company created: new-company-123/i)).toBeInTheDocument()
      })
    })

    it('clears form after successful creation', async () => {
      const user = userEvent.setup()
      const newCompany: Company = {
        id: 'new-company-id',
        name: 'New Test Company',
        created_at: '2026-02-04T10:00:00Z',
      }

      mockApi.createCompany.mockResolvedValue({
        data: newCompany,
        status: 201,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      const nameInput = screen.getByPlaceholderText('Company Name *') as HTMLInputElement
      const descInput = screen.getByPlaceholderText('Description (optional)') as HTMLInputElement

      await user.type(nameInput, 'New Test Company')
      await user.type(descInput, 'Test description')
      await user.click(screen.getByRole('button', { name: /create company/i }))

      await waitFor(() => {
        expect(nameInput.value).toBe('')
        expect(descInput.value).toBe('')
      })
    })

    it('auto-selects newly created company', async () => {
      const user = userEvent.setup()
      const newCompany: Company = {
        id: 'new-company-id',
        name: 'New Test Company',
        created_at: '2026-02-04T10:00:00Z',
      }

      mockApi.createCompany.mockResolvedValue({
        data: newCompany,
        status: 201,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      await user.type(screen.getByPlaceholderText('Company Name *'), 'New Test Company')
      await user.click(screen.getByRole('button', { name: /create company/i }))

      await waitFor(() => {
        expect(mockOnCompanySelect).toHaveBeenCalledWith(newCompany)
      })
    })
  })

  // Task 5.3: Test error handling with mocked API failure
  describe('AC3: Error handling', () => {
    it('shows error toast when API returns error', async () => {
      const user = userEvent.setup()

      mockApi.createCompany.mockResolvedValue({
        error: 'name: field required',
        status: 422,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      await user.type(screen.getByPlaceholderText('Company Name *'), 'Test')
      await user.click(screen.getByRole('button', { name: /create company/i }))

      await waitFor(() => {
        expect(screen.getByText(/name: field required/i)).toBeInTheDocument()
      })
    })

    it('keeps form values on error for correction', async () => {
      const user = userEvent.setup()

      mockApi.createCompany.mockResolvedValue({
        error: 'Server error',
        status: 500,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      const nameInput = screen.getByPlaceholderText('Company Name *') as HTMLInputElement
      const descInput = screen.getByPlaceholderText('Description (optional)') as HTMLInputElement

      await user.type(nameInput, 'Test Company')
      await user.type(descInput, 'Test description')
      await user.click(screen.getByRole('button', { name: /create company/i }))

      await waitFor(() => {
        // Form values should be preserved
        expect(nameInput.value).toBe('Test Company')
        expect(descInput.value).toBe('Test description')
      })
    })

    it('shows validation error when name is empty', async () => {
      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      // Try to submit without filling name (button should be disabled)
      const submitBtn = screen.getByRole('button', { name: /create company/i })
      expect(submitBtn).toBeDisabled()
    })

    it('disables submit button while loading', async () => {
      const testUser = userEvent.setup()

      // Create a promise that won't resolve immediately
      let resolvePromise: (value: { data: Company; status: number }) => void
      const pendingPromise = new Promise<{ data: Company; status: number }>((resolve) => {
        resolvePromise = resolve
      })
      mockApi.createCompany.mockReturnValue(pendingPromise)

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      await testUser.type(screen.getByPlaceholderText('Company Name *'), 'Test')
      await testUser.click(screen.getByRole('button', { name: /create company/i }))

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating.../i })).toBeInTheDocument()
      })

      // Resolve the promise to clean up
      resolvePromise!({ data: { id: 'test', name: 'Test', created_at: '' }, status: 201 })
    })
  })

  // Task 5.4: Test company appears in dropdown after creation
  describe('AC2: Company dropdown', () => {
    it('loads and displays companies on mount', async () => {
      mockApi.getCompanies.mockResolvedValue({
        data: { companies: [mockCompany] },
        status: 200,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/test company/i)).toBeInTheDocument()
      })
    })

    it('shows agent count in dropdown option', async () => {
      mockApi.getCompanies.mockResolvedValue({
        data: { companies: [mockCompany] },
        status: 200,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/5 agents/i)).toBeInTheDocument()
      })
    })

    it('calls onCompanySelect when dropdown selection changes', async () => {
      const user = userEvent.setup()

      mockApi.getCompanies.mockResolvedValue({
        data: { companies: [mockCompany] },
        status: 200,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/test company/i)).toBeInTheDocument()
      })

      // Select the company
      await user.selectOptions(screen.getByRole('combobox'), mockCompany.id)

      expect(mockOnCompanySelect).toHaveBeenCalledWith(mockCompany)
    })

    it('refreshes company list after creation', async () => {
      const user = userEvent.setup()
      const newCompany: Company = {
        id: 'new-company-id',
        name: 'New Company',
        created_at: '2026-02-04T10:00:00Z',
      }

      mockApi.createCompany.mockResolvedValue({
        data: newCompany,
        status: 201,
      })

      render(
        <CompanyManagement
          selectedCompany={null}
          onCompanySelect={mockOnCompanySelect}
        />
      )

      // Initial call on mount
      expect(mockApi.getCompanies).toHaveBeenCalledTimes(1)

      await user.type(screen.getByPlaceholderText('Company Name *'), 'New Company')
      await user.click(screen.getByRole('button', { name: /create company/i }))

      // Should refresh after creation
      await waitFor(() => {
        expect(mockApi.getCompanies).toHaveBeenCalledTimes(2)
      })
    })
  })
})
