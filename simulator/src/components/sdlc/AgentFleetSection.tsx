import { useState } from 'react'
import { api } from '../../services/api'
import type { Company, Agent } from '../../types'
import { SDLC_ROLES, getSDLCRole } from '../../types'

interface AgentFleetSectionProps {
  company: Company | null
  agents: Agent[]
  onAgentsChange: (agents: Agent[]) => void
}

const statusStyles: Record<string, string> = {
  idle: 'bg-emerald-500/10 text-emerald-400',
  working: 'bg-amber-500/10 text-amber-400',
  thinking: 'bg-purple-500/10 text-purple-400',
  walking: 'bg-blue-500/10 text-blue-400',
  executing: 'bg-cyan-500/10 text-cyan-400',
  error: 'bg-red-500/10 text-red-400',
}

export default function AgentFleetSection({
  company,
  agents,
  onAgentsChange,
}: AgentFleetSectionProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<string>(SDLC_ROLES[6].value) // default: dev
  const [creating, setCreating] = useState(false)

  const refreshAgents = async () => {
    if (!company) return
    const response = await api.getAgents(company.id)
    if (response.data) {
      onAgentsChange(response.data)
    }
  }

  const handleCreate = async () => {
    if (!company || !name.trim()) return
    setCreating(true)
    const agentId = `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    await api.createAgent(company.id, agentId, name.trim(), role)
    setName('')
    await refreshAgents()
    setCreating(false)
  }

  const handleDelete = async (agentId: string) => {
    if (!company) return
    await api.deleteAgent(company.id, agentId)
    await refreshAgents()
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a0aac8]">
          Agent Fleet
        </h2>
      </div>

      <div className="rounded-xl p-4 border mb-4" style={{ background: 'rgba(30,30,60,0.5)', borderColor: 'rgba(100,100,150,0.2)' }}>
        <p className="text-[10px] text-[#a0aac8] uppercase tracking-tighter mb-3 font-bold">
          Quick Add Agent
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Agent Name"
              className="rounded-lg text-xs text-[#e0e8ff] h-10 px-3 outline-none focus:ring-1 focus:ring-cyan-400/40 placeholder-[#a0aac8]/50"
              style={{ background: 'rgba(20,20,50,0.9)', border: '1px solid rgba(0,255,255,0.4)' }}
              disabled={!company}
            />
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={!company}
                className="w-full appearance-none rounded-lg text-xs text-[#e0e8ff] h-10 px-3 pr-8 outline-none focus:ring-1 focus:ring-cyan-400/40"
                style={{ background: 'rgba(20,20,50,0.9)', border: '1px solid rgba(0,255,255,0.4)' }}
              >
                {SDLC_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400/60 text-sm pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!company || !name.trim() || creating}
            className="w-full bg-cyan-500/10 text-cyan-400 py-2 rounded-lg text-xs font-bold hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 border border-cyan-400/20"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            {creating ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border" style={{ background: 'rgba(30,30,60,0.5)', borderColor: 'rgba(100,100,150,0.2)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)' }} className="text-[#a0aac8]">
              <th className="px-4 py-3 font-medium">Agent / Role</th>
              <th className="px-4 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#646496]/20">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-xs text-[#a0aac8]">
                  {company ? 'No agents yet. Add one above.' : 'Select a company first.'}
                </td>
              </tr>
            ) : (
              agents.map((agent) => {
                const roleInfo = getSDLCRole(agent.role)
                return (
                  <tr key={agent.id} className="group hover:bg-cyan-400/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#e0e8ff]">{agent.name}</span>
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: roleInfo?.color || '#a0aac8' }}
                          >
                            {roleInfo?.icon || ''} {roleInfo?.label || agent.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                            statusStyles[agent.status] || statusStyles.idle
                          }`}
                        >
                          {agent.status}
                        </span>
                        <button
                          onClick={() => handleDelete(agent.id)}
                          aria-label={`Delete agent ${agent.name}`}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all text-[#a0aac8] hover:text-red-400"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
