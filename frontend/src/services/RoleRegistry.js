const DEFAULT_ROLES = {
    analyst: { id: 'analyst', name: 'Analyst', fullName: 'Business Analyst', color: 0x4ECDC4, colorHex: '#4ECDC4', icon: '📊', description: 'Business analysis and research specialist', tasks: ['Research market','Document requirements','Interview stakeholders'], skills: ['Research','Documentation','Analysis','Communication'], floorType: 'stone' },
    pm: { id: 'pm', name: 'PM', fullName: 'Product Manager', color: 0xFF6B6B, colorHex: '#FF6B6B', icon: '📋', description: 'Product requirements and planning expert', tasks: ['Create PRD','Define features','Prioritize backlog'], skills: ['Strategy','Prioritization','Communication','Vision'], floorType: 'wood' },
    po: { id: 'po', name: 'PO', fullName: 'Product Owner', color: 0xFFE66D, colorHex: '#FFE66D', icon: '👑', description: 'Product alignment and backlog manager', tasks: ['Manage backlog','Accept stories','Align teams'], skills: ['Decision Making','Alignment','Validation','Leadership'], floorType: 'brick' },
    architect: { id: 'architect', name: 'Architect', fullName: 'System Architect', color: 0x95E1D3, colorHex: '#95E1D3', icon: '🏗️', description: 'System architecture and technical design expert', tasks: ['Design system','Define APIs','Tech decisions'], skills: ['System Design','Tech Stack','Scalability','Integration'], floorType: 'stone' },
    ux: { id: 'ux', name: 'UX', fullName: 'UX Designer', color: 0xDDA0DD, colorHex: '#DDA0DD', icon: '🎨', description: 'User experience and UI design specialist', tasks: ['User research','Create wireframes','Design UI'], skills: ['Design','Prototyping','User Research','Accessibility'], floorType: 'tile' },
    sm: { id: 'sm', name: 'SM', fullName: 'Scrum Master', color: 0xF7DC6F, colorHex: '#F7DC6F', icon: '🎯', description: 'Sprint planning and story preparation orchestrator', tasks: ['Plan sprints','Draft stories','Remove blockers'], skills: ['Agile','Facilitation','Planning','Coaching'], floorType: 'wood' },
    dev: { id: 'dev', name: 'Dev', fullName: 'Developer', color: 0x74B9FF, colorHex: '#74B9FF', icon: '💻', description: 'Code implementation and testing specialist', tasks: ['Write code','Code review','Unit testing'], skills: ['Coding','Testing','Problem Solving','Collaboration'], floorType: 'wood' },
    developer: { id: 'developer', name: 'Dev', fullName: 'Developer', color: 0x74B9FF, colorHex: '#74B9FF', icon: '💻', description: 'Code implementation and testing specialist', tasks: ['Write code','Code review','Unit testing'], skills: ['Coding','Testing','Problem Solving','Collaboration'], floorType: 'wood' },
    qa: { id: 'qa', name: 'QA', fullName: 'QA Engineer', color: 0xA29BFE, colorHex: '#A29BFE', icon: '🔍', description: 'Quality assurance and test architect', tasks: ['Write test cases','Automation','Bug verification'], skills: ['Testing','Automation','Quality Control','Detail-oriented'], floorType: 'tile' },
    devops: { id: 'devops', name: 'DevOps', fullName: 'DevOps Engineer', color: 0xFD79A8, colorHex: '#FD79A8', icon: '⚙️', description: 'Infrastructure and deployment specialist', tasks: ['CI/CD pipeline','Infrastructure','Monitoring'], skills: ['Infrastructure','Automation','Security','Monitoring'], floorType: 'metal' },
    orchestrator: { id: 'orchestrator', name: 'Orchestrator', fullName: 'Project Orchestrator', color: 0x00CEC9, colorHex: '#00CEC9', icon: '🎭', description: 'Coordinates interactions between all agents', tasks: ['Coordinate agents','Manage workflow','Track progress'], skills: ['Coordination','Management','Communication','Overview'], floorType: 'brick' }
};

const DEFAULT_DEPARTMENT_LAYOUT = [
    { roleId: 'analyst', x: 0, y: 0, width: 7, height: 6 },
    { roleId: 'pm', x: 13, y: 0, width: 7, height: 6 },
    { roleId: 'po', x: 26, y: 0, width: 7, height: 6 },
    { roleId: 'orchestrator', x: 39, y: 0, width: 8, height: 7 },
    { roleId: 'architect', x: 0, y: 12, width: 7, height: 6 },
    { roleId: 'ux', x: 13, y: 12, width: 7, height: 6 },
    { roleId: 'sm', x: 26, y: 12, width: 7, height: 6 },
    { roleId: 'dev', x: 0, y: 24, width: 10, height: 7 },
    { roleId: 'qa', x: 16, y: 24, width: 8, height: 7 },
    { roleId: 'devops', x: 30, y: 24, width: 8, height: 7 }
];

// Map backend role IDs to default layout role IDs
const ROLE_ALIAS = {
    developer: 'dev'
};

export class RoleRegistry {
    constructor() {
        this.roles = {};
        // Deep copy defaults
        for (const [key, val] of Object.entries(DEFAULT_ROLES)) {
            this.roles[key] = { ...val };
        }
        this.dynamicDepartments = [];
    }

    getRole(roleId) {
        const normalized = roleId.toLowerCase();
        if (this.roles[normalized]) {
            return this.roles[normalized];
        }
        // Generate dynamic config for unknown role
        return this._createDynamicRole(normalized);
    }

    _createDynamicRole(roleId) {
        const role = {
            id: roleId,
            name: roleId.charAt(0).toUpperCase() + roleId.slice(1),
            fullName: roleId.charAt(0).toUpperCase() + roleId.slice(1),
            color: 0x888888,
            colorHex: '#888888',
            icon: '🔧',
            description: `${roleId} role`,
            tasks: [],
            skills: [],
            floorType: 'stone'
        };
        this.roles[roleId] = role;
        return role;
    }

    mergeBackendRoles(roleConfigsMap) {
        if (!roleConfigsMap) return;
        for (const [roleId, config] of Object.entries(roleConfigsMap)) {
            const normalized = roleId.toLowerCase();
            if (this.roles[normalized]) {
                // Update existing role colors from backend
                if (config.color) {
                    this.roles[normalized].colorHex = config.color;
                    this.roles[normalized].color = parseInt(config.color.replace('#', ''), 16);
                }
                if (config.display_name) {
                    this.roles[normalized].name = config.display_name;
                }
            } else {
                // Create new role from backend config
                const color = config.color || '#888888';
                this.roles[normalized] = {
                    id: normalized,
                    name: config.display_name || normalized.charAt(0).toUpperCase() + normalized.slice(1),
                    fullName: config.display_name || normalized.charAt(0).toUpperCase() + normalized.slice(1),
                    color: parseInt(color.replace('#', ''), 16),
                    colorHex: color,
                    icon: '🔧',
                    description: `${config.display_name || roleId} role`,
                    tasks: [],
                    skills: [],
                    floorType: 'stone'
                };
            }
        }
    }

    getDepartments() {
        const departments = [];
        const usedRoleIds = new Set();

        // Default layout departments
        for (const layout of DEFAULT_DEPARTMENT_LAYOUT) {
            const role = this.roles[layout.roleId];
            if (role) {
                departments.push({ role, x: layout.x, y: layout.y, width: layout.width, height: layout.height });
                usedRoleIds.add(layout.roleId);
                // Also mark aliases
                if (ROLE_ALIAS[layout.roleId]) usedRoleIds.add(ROLE_ALIAS[layout.roleId]);
            }
        }

        // Overflow positions for dynamic roles not in default layout
        let overflowRow = 0;
        for (const [roleId, role] of Object.entries(this.roles)) {
            // Skip if already in layout or is an alias of a layout role
            const aliasTarget = ROLE_ALIAS[roleId];
            if (usedRoleIds.has(roleId) || usedRoleIds.has(aliasTarget) || (aliasTarget && usedRoleIds.has(aliasTarget))) continue;
            // Skip the 'developer' alias entry if 'dev' already placed
            if (roleId === 'developer' && usedRoleIds.has('dev')) continue;

            departments.push({
                role,
                x: 0,
                y: 37 + overflowRow * 8,
                width: 7,
                height: 6
            });
            usedRoleIds.add(roleId);
            overflowRow++;
        }

        return departments;
    }

    // H2: Resolve role alias (e.g., 'developer' → 'dev') for department lookups
    resolveAlias(roleId) {
        const normalized = roleId.toLowerCase();
        return ROLE_ALIAS[normalized] || normalized;
    }
}
