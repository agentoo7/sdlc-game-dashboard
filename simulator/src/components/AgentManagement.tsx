import { useState, useEffect, FormEvent } from 'react'
import { api } from '../services/api'
import type { Company, Agent } from '../types'
import { DEFAULT_ROLES, getRoleColor, getRoleDisplayName } from '../types'

interface AgentManagementProps {
  company: Company | null
  agents: Agent[]
  onAgentsChange: (agents: Agent[]) => void
}

interface Toast {
  type: 'success' | 'error'
  message: string
}

function AgentManagement({ company, agents, onAgentsChange }: AgentManagementProps) {
  // Form state
  const [agentId, setAgentId] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('developer')
  const [customRole, setCustomRole] = useState('')
  const [showCustomRole, setShowCustomRole] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Loading state
  const [loadingAgents, setLoadingAgents] = useState(false)

  // Toast state
  const [toast, setToast] = useState<Toast | null>(null)

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Fetch agents when company changes
  useEffect(() => {
    if (company) {
      loadAgents()
    } else {
      onAgentsChange([])
    }
  }, [company?.id])

  const loadAgents = async () => {
    if (!company) return

    setLoadingAgents(true)
    const response = await api.getAgents(company.id)
    if (response.data) {
      onAgentsChange(response.data)
    } else if (response.error) {
      setToast({ type: 'error', message: `Failed to load agents: ${response.error}` })
    }
    setLoadingAgents(false)
  }

  const handleRoleChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomRole(true)
      setRole('')
    } else {
      setShowCustomRole(false)
      setCustomRole('')
      setRole(value)
    }
  }

  const validateForm = (): boolean => {
    if (!agentId.trim()) {
      setValidationError('Agent ID is required')
      return false
    }
    if (!name.trim()) {
      setValidationError('Agent name is required')
      return false
    }
    const effectiveRole = showCustomRole ? customRole.trim() : role
    if (!effectiveRole) {
      setValidationError('Role is required')
      return false
    }
    // Check for duplicate agent ID
    if (agents.some(a => a.id === agentId.trim())) {
      setValidationError('Agent ID already exists')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!company) {
      setValidationError('Please select a company first')
      return
    }

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setValidationError(null)

    const effectiveRole = showCustomRole ? customRole.trim() : role

    const response = await api.createAgent(
      company.id,
      agentId.trim(),
      name.trim(),
      effectiveRole
    )

    if (response.data) {
      setToast({ type: 'success', message: `Agent added: ${response.data.id}` })

      // Clear form
      setAgentId('')
      setName('')
      setRole('developer')
      setCustomRole('')
      setShowCustomRole(false)

      // Refresh agent list
      await loadAgents()
    } else if (response.error) {
      const errorMessage = typeof response.error === 'string'
        ? response.error
        : 'Failed to create agent'
      setToast({ type: 'error', message: errorMessage })
    }

    setSubmitting(false)
  }

  const handleDeleteClick = (agentIdToDelete: string) => {
    setDeleteConfirm(agentIdToDelete)
  }

  const handleDeleteConfirm = async () => {
    if (!company || !deleteConfirm) return

    setDeleting(true)

    const response = await api.deleteAgent(company.id, deleteConfirm)

    if (response.data) {
      setToast({ type: 'success', message: `Agent removed: ${deleteConfirm}` })
      // Refresh agent list
      await loadAgents()
    } else if (response.error) {
      setToast({ type: 'error', message: `Failed to remove agent: ${response.error}` })
    }

    setDeleting(false)
    setDeleteConfirm(null)
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(null)
  }

  // No company selected state
  if (!company) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-gray-600 bg-dashboard-bg/50">
          <h2 className="text-lg font-semibold text-dashboard-text">
            Agent Management
          </h2>
          <p className="text-sm text-dashboard-muted">
            Select a company first
          </p>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div className="flex items-center justify-center h-full text-dashboard-muted">
            <div className="text-center">
              <div className="text-4xl mb-2">👈</div>
              <p>Select a company first</p>
              <p className="text-sm">Use Company Management to select or create a company</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-600 bg-dashboard-bg/50">
        <h2 className="text-lg font-semibold text-dashboard-text">
          Agent Management
        </h2>
        <p className="text-sm text-dashboard-muted">
          Manage agents for {company.name}
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

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="mb-4 p-4 rounded-lg bg-red-900/30 border border-red-600">
            <p className="text-dashboard-text mb-3">
              Remove agent <strong>{deleteConfirm}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg text-sm"
              >
                {deleting ? 'Removing...' : 'Yes, Remove'}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Agent Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <h3 className="text-dashboard-text font-medium mb-3">Add New Agent</h3>

          {/* Validation Error */}
          {validationError && (
            <p className="mb-2 text-sm text-red-400">{validationError}</p>
          )}

          {/* Agent ID Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Agent ID (e.g., BA-001) *"
              value={agentId}
              onChange={(e) => {
                setAgentId(e.target.value)
                setValidationError(null)
              }}
              className="w-full bg-dashboard-bg text-dashboard-text rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-500"
              disabled={submitting}
            />
          </div>

          {/* Name Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Name (e.g., Alice) *"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setValidationError(null)
              }}
              className="w-full bg-dashboard-bg text-dashboard-text rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-500"
              disabled={submitting}
            />
          </div>

          {/* Role Dropdown */}
          <div className="mb-3">
            <select
              value={showCustomRole ? 'custom' : role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full bg-dashboard-bg text-dashboard-text rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
              disabled={submitting}
            >
              {DEFAULT_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
              <option value="custom">Custom Role...</option>
            </select>
          </div>

          {/* Custom Role Input */}
          {showCustomRole && (
            <div className="mb-3">
              <input
                type="text"
                placeholder="Enter custom role name *"
                value={customRole}
                onChange={(e) => {
                  setCustomRole(e.target.value)
                  setValidationError(null)
                }}
                className="w-full bg-dashboard-bg text-dashboard-text rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-500"
                disabled={submitting}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !agentId.trim() || !name.trim() || (!role && !customRole.trim())}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg p-3 transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Agent'}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-gray-600 my-4"></div>

        {/* Agent List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-dashboard-text font-medium">
              Company Agents ({agents.length})
            </h3>
            <button
              onClick={loadAgents}
              disabled={loadingAgents}
              className="text-sm text-dashboard-muted hover:text-dashboard-text"
            >
              {loadingAgents ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loadingAgents ? (
            <div className="text-center text-dashboard-muted py-4">
              Loading agents...
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center text-dashboard-muted py-4">
              <p>No agents yet</p>
              <p className="text-sm">Add an agent using the form above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 bg-dashboard-bg rounded-lg border border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    {/* Role Badge */}
                    <span
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: agent.role_config?.color || getRoleColor(agent.role) }}
                    >
                      {agent.role_config?.display_name || getRoleDisplayName(agent.role)}
                    </span>

                    {/* Agent Info */}
                    <div>
                      <div className="text-dashboard-text font-medium">
                        {agent.name}
                      </div>
                      <div className="text-xs text-dashboard-muted">
                        ID: {agent.id} • Status: {agent.status || 'idle'}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleDeleteClick(agent.id)}
                    disabled={deleteConfirm !== null}
                    className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgentManagement
