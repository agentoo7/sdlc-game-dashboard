import { useState } from 'react'
import type { Company } from '../../types'

interface CompanySectionProps {
  companies: Company[]
  selectedCompany: Company | null
  totalAgents: number
  onSelect: (company: Company) => void
  onCreate: (name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function CompanySection({
  companies,
  selectedCompany,
  totalAgents,
  onSelect,
  onCreate,
  onDelete,
}: CompanySectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    await onCreate(newName.trim())
    setNewName('')
    setShowForm(false)
    setCreating(false)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a0aac8]">
          Company Management
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add_business</span>
          + Add Company
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-3 border" style={{ background: 'rgba(30,30,60,0.5)', borderColor: 'rgba(100,100,150,0.2)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Company name..."
              className="flex-1 rounded-lg text-xs text-[#e0e8ff] h-10 px-3 outline-none focus:ring-1 focus:ring-cyan-400/40 placeholder-[#a0aac8]/50"
              style={{ background: 'rgba(20,20,50,0.9)', border: '1px solid rgba(0,255,255,0.4)' }}
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="bg-cyan-500/20 text-cyan-400 px-4 rounded-lg text-xs font-bold hover:bg-cyan-500/30 disabled:opacity-50 transition-colors border border-cyan-400/30"
            >
              {creating ? '...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 border" style={{ background: 'rgba(30,30,60,0.5)', borderColor: 'rgba(100,100,150,0.2)' }}>
          <span className="text-[10px] text-[#a0aac8] uppercase font-bold block mb-1">
            Active Orgs
          </span>
          <span className="text-xl font-bold text-cyan-300">{companies.length}</span>
        </div>
        <div className="rounded-xl p-3 border" style={{ background: 'rgba(30,30,60,0.5)', borderColor: 'rgba(100,100,150,0.2)' }}>
          <span className="text-[10px] text-[#a0aac8] uppercase font-bold block mb-1">
            Total Agents
          </span>
          <span className="text-xl font-bold text-cyan-300">{totalAgents}</span>
        </div>
      </div>

      {companies.length > 0 && (
        <div className="space-y-2">
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => onSelect(company)}
              className={`rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between border ${
                selectedCompany?.id === company.id
                  ? 'border-cyan-400/40 bg-cyan-400/[0.15]'
                  : 'hover:bg-cyan-400/10 hover:border-cyan-400/30'
              }`}
              style={selectedCompany?.id !== company.id ? { background: 'rgba(0,0,0,0.2)', borderColor: 'transparent' } : undefined}
            >
              <div>
                <span className="text-sm font-medium text-[#e0e8ff]">{company.name}</span>
                {company.agent_count !== undefined && (
                  <span className="text-[10px] text-[#a0aac8] ml-2">
                    {company.agent_count} agents
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(company.id)
                }}
                aria-label={`Delete company ${company.name}`}
                className="p-1 hover:bg-red-500/20 rounded-lg transition-colors text-[#a0aac8] hover:text-red-400"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
