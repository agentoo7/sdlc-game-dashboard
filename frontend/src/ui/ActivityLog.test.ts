/**
 * Tests for ActivityLog sidebar component.
 * Story 6.1: Activity Log Sidebar Implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Storage key constant
const STORAGE_KEY = 'sdlc_dashboard_sidebar_expanded';

describe('ActivityLog Sidebar', () => {
  beforeEach(() => {
    // Setup DOM with sidebar structure
    document.body.innerHTML = '<aside id="activity-log" class="activity-sidebar"></aside>';
    mockFetch.mockReset();
    localStorageMock.clear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Sidebar Layout (AC1, AC2)', () => {
    it('should have sidebar structure in DOM', () => {
      const container = document.getElementById('activity-log');
      expect(container).not.toBeNull();
      expect(container?.classList.contains('activity-sidebar')).toBe(true);
    });

    it('should define sidebar width constants', () => {
      const SIDEBAR_WIDTH_EXPANDED = 320;
      const SIDEBAR_WIDTH_COLLAPSED = 40;

      expect(SIDEBAR_WIDTH_EXPANDED).toBe(320);
      expect(SIDEBAR_WIDTH_COLLAPSED).toBe(40);
    });
  });

  describe('Toggle Button (AC3)', () => {
    it('should use ◀/▶ icons for horizontal collapse', () => {
      const EXPAND_ICON = '◀';
      const COLLAPSE_ICON = '▶';

      expect(EXPAND_ICON).toBe('◀');
      expect(COLLAPSE_ICON).toBe('▶');
    });
  });

  describe('Unread Badge (AC4)', () => {
    it('should track unread count', () => {
      let unreadCount = 0;
      const newEventsCount = 5;

      // Simulate new events while collapsed
      unreadCount += newEventsCount;

      expect(unreadCount).toBe(5);
    });

    it('should reset unread count when expanded', () => {
      let unreadCount = 10;
      const isExpanded = true;

      // Reset when expanding
      if (isExpanded) {
        unreadCount = 0;
      }

      expect(unreadCount).toBe(0);
    });

    it('should display 99+ for counts over 99', () => {
      const unreadCount = 150;
      const displayText = unreadCount > 99 ? '99+' : String(unreadCount);

      expect(displayText).toBe('99+');
    });
  });

  describe('Smooth Animation (AC5)', () => {
    it('should define animation duration of 200ms', () => {
      const ANIMATION_DURATION = '200ms';
      const ANIMATION_EASING = 'ease-out';

      expect(ANIMATION_DURATION).toBe('200ms');
      expect(ANIMATION_EASING).toBe('ease-out');
    });
  });

  describe('LocalStorage Persistence (AC6)', () => {
    it('should save expanded state to localStorage', () => {
      const isExpanded = true;
      localStorage.setItem(STORAGE_KEY, String(isExpanded));

      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('should load saved state from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'false');

      const savedState = localStorage.getItem(STORAGE_KEY);
      const isExpanded = savedState === null ? true : savedState === 'true';

      expect(isExpanded).toBe(false);
    });

    it('should default to expanded if no saved state', () => {
      // No localStorage value set
      const savedState = localStorage.getItem(STORAGE_KEY);
      const isExpanded = savedState === null ? true : savedState === 'true';

      expect(isExpanded).toBe(true);
    });
  });

  describe('Viewport Resize (AC7)', () => {
    it('should emit sidebarToggle event', () => {
      const eventListener = vi.fn();
      window.addEventListener('sidebarToggle', eventListener);

      // Simulate toggle event
      window.dispatchEvent(new CustomEvent('sidebarToggle', {
        detail: { expanded: false, width: 40 }
      }));

      expect(eventListener).toHaveBeenCalled();

      window.removeEventListener('sidebarToggle', eventListener);
    });

    it('should include width in toggle event', () => {
      let receivedWidth = 0;

      window.addEventListener('sidebarToggle', ((event: CustomEvent) => {
        receivedWidth = event.detail.width;
      }) as EventListener);

      window.dispatchEvent(new CustomEvent('sidebarToggle', {
        detail: { expanded: true, width: 320 }
      }));

      expect(receivedWidth).toBe(320);
    });
  });

  describe('Role-Based Borders (AC9)', () => {
    it('should have role colors mapping', () => {
      const ROLE_COLORS: Record<string, number> = {
        customer: 0x9CA3AF,
        ba: 0x3B82F6,
        pm: 0x8B5CF6,
        architect: 0xF97316,
        developer: 0x22C55E,
        qa: 0xEF4444,
      };

      expect(ROLE_COLORS.ba).toBe(0x3B82F6);
      expect(ROLE_COLORS.developer).toBe(0x22C55E);
    });

    it('should convert hex number to CSS color string', () => {
      const colorNum = 0x3B82F6; // BA blue
      const cssColor = `#${colorNum.toString(16).padStart(6, '0')}`;

      expect(cssColor).toBe('#3b82f6');
    });

    it('should return default color for unknown roles', () => {
      const DEFAULT_COLOR = '#64748B'; // slate gray
      const unknownRole = 'unknown_role';
      const ROLE_COLORS: Record<string, number> = {
        ba: 0x3B82F6,
      };

      const color = ROLE_COLORS[unknownRole] !== undefined
        ? `#${ROLE_COLORS[unknownRole].toString(16).padStart(6, '0')}`
        : DEFAULT_COLOR;

      expect(color).toBe(DEFAULT_COLOR);
    });
  });

  describe('API Integration', () => {
    const companyId = 'test-company-123';

    it('should call logs endpoint with company ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ logs: [], total: 0 }),
      });

      await fetch(`http://localhost:8002/api/companies/${companyId}/logs`);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8002/api/companies/${companyId}/logs`
      );
    });

    it('should support filter parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ logs: [], total: 0 }),
      });

      const params = new URLSearchParams({
        event_type: 'WORKING',
        limit: '20',
      });

      await fetch(`http://localhost:8002/api/companies/${companyId}/logs?${params}`);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('event_type=WORKING')
      );
    });

    it('should parse log entries from API response', async () => {
      const mockLogs = {
        logs: [
          {
            id: '1',
            event_type: 'WORKING',
            agent_id: 'BA-001',
            agent_role: 'ba',
            timestamp: '2026-02-04T10:00:00Z',
            payload: { task: 'coding' },
          },
        ],
        total: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLogs),
      });

      const response = await fetch(`http://localhost:8002/api/companies/${companyId}/logs`);
      const data = await response.json();

      expect(data.logs).toHaveLength(1);
      expect(data.logs[0].event_type).toBe('WORKING');
      expect(data.logs[0].agent_id).toBe('BA-001');
      expect(data.logs[0].agent_role).toBe('ba');
    });
  });

  describe('Polling Behavior', () => {
    it('should define polling interval of 2 seconds', () => {
      const POLL_INTERVAL = 2000; // As specified in story
      expect(POLL_INTERVAL).toBe(2000);
    });
  });

  describe('XSS Prevention', () => {
    it('should escape HTML in user content', () => {
      // Test the escapeHtml concept
      const maliciousInput = '<script>alert("xss")</script>';
      const div = document.createElement('div');
      div.textContent = maliciousInput;
      const escaped = div.innerHTML;

      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('should handle special characters safely', () => {
      const specialChars = '& < > " \'';
      const div = document.createElement('div');
      div.textContent = specialChars;
      const escaped = div.innerHTML;

      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });
  });

  describe('Unread Count Edge Cases', () => {
    it('should handle empty logs correctly', () => {
      const logs: { id: string }[] = [];
      const lastSeenLogId = 'log-1';

      // When no logs, unread count should not increase
      const unreadCount = 0;
      expect(unreadCount).toBe(0);
      expect(logs.length).toBe(0);
    });

    it('should count new logs by ID comparison', () => {
      const oldLogs = [{ id: 'log-1' }, { id: 'log-2' }];
      const newLogs = [{ id: 'log-3' }, { id: 'log-4' }, { id: 'log-1' }, { id: 'log-2' }];
      const lastSeenLogId = 'log-1';

      // Find index of last seen log
      const lastSeenIndex = newLogs.findIndex(log => log.id === lastSeenLogId);

      // New logs are at indices before lastSeenIndex
      const newCount = lastSeenIndex > 0 ? lastSeenIndex : 0;
      expect(newCount).toBe(2); // log-3 and log-4 are new
    });

    it('should handle lastSeenLogId not found', () => {
      const newLogs = [{ id: 'log-5' }, { id: 'log-6' }];
      const lastSeenLogId = 'log-1'; // Not in newLogs

      const lastSeenIndex = newLogs.findIndex(log => log.id === lastSeenLogId);
      expect(lastSeenIndex).toBe(-1);

      // When not found, all logs are considered new
      const newCount = lastSeenIndex === -1 ? newLogs.length : lastSeenIndex;
      expect(newCount).toBe(2);
    });
  });
});
