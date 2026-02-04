// Agent types
export interface Agent {
  agent_id: string;
  name: string;
  role: string;
  status: AgentStatus;
  position: Position;
  current_task?: string;
  role_config?: RoleConfig;
}

export interface Position {
  zone: string;
  x: number;
  y: number;
}

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'walking' | 'executing' | 'error';

// Company types
export interface Company {
  company_id: string;
  name: string;
  description?: string;
  agent_count: number;
  last_activity?: string;
  status?: string;
}

export interface CompanyState {
  company_id: string;
  agents: Agent[];
  pending_movements: PendingMovement[];
  role_configs: Record<string, RoleConfig>;
}

// Movement types
export interface PendingMovement {
  agent_id: string;
  from_zone: string;
  to_zone: string;
  purpose: string;
  artifact?: string;
  progress?: number;
}

// Role configuration (for dynamic roles)
export interface RoleConfig {
  role_id: string;
  display_name: string;
  color: string;
  zone_color: string;
  is_default: boolean;
}

// Event types
export interface Event {
  id: string;
  timestamp: string;
  from_agent?: string;
  to_agent?: string;
  event_type: EventType;
  payload: Record<string, unknown>;
  inferred_actions: string[];
}

export type EventType =
  | 'WORK_REQUEST'
  | 'WORK_COMPLETE'
  | 'REVIEW_REQUEST'
  | 'FEEDBACK'
  | 'THINKING'
  | 'WORKING'
  | 'IDLE';

// Log entry for activity log
export interface LogEntry {
  id: string;
  timestamp: string;
  from_agent?: string;
  to_agent?: string;
  event_type: string;
  payload: Record<string, unknown>;
  inferred_actions?: string[];
  summary?: string;
}
