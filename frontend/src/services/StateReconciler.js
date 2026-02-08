import { AGENT_STATES } from '../classes/Agent.js';

export class StateReconciler {
    reconcileAgents(agentMap, apiAgents, roleRegistry) {
        const toAdd = [];
        const toRemove = [];
        const toUpdate = [];

        const apiAgentIds = new Set();

        for (const apiAgent of apiAgents) {
            apiAgentIds.add(apiAgent.agent_id);

            const existing = agentMap.get(apiAgent.agent_id);
            if (!existing) {
                toAdd.push(apiAgent);
            } else if (!existing.isBusy) {
                // Check if status or current_task changed
                const targetState = this.mapBackendStatus(apiAgent.status);
                if (existing.state.id !== targetState.id || existing.currentTask !== apiAgent.current_task) {
                    toUpdate.push(apiAgent);
                }
            }
        }

        for (const [agentId] of agentMap) {
            if (!apiAgentIds.has(agentId)) {
                toRemove.push(agentId);
            }
        }

        return { toAdd, toRemove, toUpdate };
    }

    mapBackendStatus(backendStatus) {
        switch (backendStatus) {
            case 'idle': return AGENT_STATES.IDLE;
            case 'thinking': return AGENT_STATES.THINKING;
            case 'working': return AGENT_STATES.WORKING;
            case 'executing': return AGENT_STATES.WORKING;
            case 'coding': return AGENT_STATES.CODING;
            case 'discussing': return AGENT_STATES.DISCUSSING;
            case 'reviewing': return AGENT_STATES.REVIEWING;
            case 'break': return AGENT_STATES.BREAK;
            case 'walking': return AGENT_STATES.WALKING;
            case 'error': return AGENT_STATES.IDLE;
            default: return AGENT_STATES.IDLE;
        }
    }

}
