import { useState, useEffect, FormEvent } from 'react'
import { api } from '../services/api'
import type { Company } from '../types'

interface CompanyManagementProps {
  selectedCompany: Company | null
  onCompanySelect: (company: Company | null) => void
}

interface Toast {
  type: 'success' | 'error'
  message: string
}

function CompanyManagement({ selectedCompany, onCompanySelect }: CompanyManagementProps) {
  // Company list state
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Toast state
  const [toast, setToast] = useState<Toast | null>(null)

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Fetch companies on mount
  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    setLoadingCompanies(true)
    try {
      const response = await api.getCompanies()
      if (response.data) {
        // API returns { companies: [...] }
        const data = response.data as { companies?: Company[] }
        const companiesList = data.companies || (Array.isArray(response.data) ? response.data : [])
        // Map company_id to id for frontend compatibility
        const mappedCompanies = companiesList.map((c: Company & { company_id?: string }) => ({
          ...c,
          id: c.id || c.company_id || '',
        }))
        setCompanies(mappedCompanies)
      } else if (response.error) {
        setToast({ type: 'error', message: `Failed to load companies: ${response.error}` })
        setCompanies([])
      } else {
        setCompanies([])
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load companies: Network error' })
      setCompanies([])
    }
    setLoadingCompanies(false)
  }

  const handleNameChange = (value: string) => {
    setName(value)
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null)
    }
  }

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setValidationError('Company name is required')
      return false
    }
    if (name.trim().length < 1) {
      setValidationError('Company name must be at least 1 character')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setValidationError(null)

    const response = await api.createCompany(name.trim(), description.trim() || undefined)

    if (response.data) {
      // Success - show toast, refresh list, auto-select new company
      setToast({ type: 'success', message: `Company created: ${response.data.id}` })

      // Clear form
      setName('')
      setDescription('')

      // Refresh company list and select the new company
      await loadCompanies()
      onCompanySelect(response.data)
    } else if (response.error) {
      // Error - show toast, keep form values
      const errorMessage = typeof response.error === 'string'
        ? response.error
        : 'Failed to create company'
      setToast({ type: 'error', message: errorMessage })
    }

    setSubmitting(false)
  }

  const handleCompanySelect = (companyId: string) => {
    if (!companyId) {
      onCompanySelect(null)
      return
    }
    const company = companies.find(c => c.id === companyId)
    if (company) {
      onCompanySelect(company)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-600 bg-dashboard-bg/50">
        <h2 className="text-lg font-semibold text-dashboard-text">
          Company Management
        </h2>
        <p className="text-sm text-dashboard-muted">
          Create and manage companies for testing
        </p>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              toast.type === 'success'
                ? 'bg-green-900/50 border border-green-600 text-green-400'
                : 'bg-red-900/50 border border-red-600 text-red-400'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Active Companies Dropdown */}
        <div className="mb-6">
          <label className="block text-dashboard-muted text-sm mb-2">
            Active Companies
          </label>
          <select
            className="w-full bg-dashboard-bg text-dashboard-text rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            value={selectedCompany?.id || ''}
            onChange={(e) => handleCompanySelect(e.target.value)}
            disabled={loadingCompanies}
          >
            <option value="">
              {loadingCompanies ? 'Loading companies...' : 'Select a company...'}
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
                {company.agent_count !== undefined ? ` (${company.agent_count} agents)` : ''}
              </option>
            ))}
          </select>
          {selectedCompany?.id && (
            <p className="mt-2 text-xs text-dashboard-muted">
              Selected: {selectedCompany.name} (ID: {selectedCompany.id.slice(0, 8)}...)
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 my-4"></div>

        {/* Create Company Form */}
        <form onSubmit={handleSubmit}>
          <h3 className="text-dashboard-text font-medium mb-3">Create New Company</h3>

          {/* Company Name Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Company Name *"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full bg-dashboard-bg text-dashboard-text rounded-lg p-3 border ${
                validationError ? 'border-red-500' : 'border-gray-600'
              } focus:border-blue-500 focus:outline-none placeholder-gray-500`}
              disabled={submitting}
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-400">{validationError}</p>
            )}
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dashboard-bg text-dashboard-text rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-500"
              disabled={submitting}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg p-3 transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Company'}
          </button>
        </form>

        {/* Refresh Button */}
        <button
          onClick={loadCompanies}
          disabled={loadingCompanies}
          className="w-full mt-3 bg-dashboard-bg hover:bg-gray-700 border border-gray-600 text-dashboard-muted font-medium rounded-lg p-2 transition-colors text-sm"
        >
          {loadingCompanies ? 'Refreshing...' : 'Refresh Company List'}
        </button>
      </div>
    </div>
  )
}

export default CompanyManagement
