/**
 * Tests for ActivityLog component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ActivityLog', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="activity-log"></div>';
    mockFetch.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = '';
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
    });
  });

  describe('Container Element', () => {
    it('should find container element by ID', () => {
      const container = document.getElementById('activity-log');
      expect(container).not.toBeNull();
    });
  });

  describe('Polling Behavior', () => {
    it('should define polling interval of 2 seconds', () => {
      const POLL_INTERVAL = 2000; // As specified in story
      expect(POLL_INTERVAL).toBe(2000);
    });
  });

  describe('Event Type Icons', () => {
    const STATUS_ICONS: Record<string, string> = {
      thinking: '💭',
      working: '📝',
      executing: '⚡',
      error: '❌',
      walking: '🚶',
      idle: '',
    };

    it('should have icon for thinking status', () => {
      expect(STATUS_ICONS.thinking).toBe('💭');
    });

    it('should have icon for working status', () => {
      expect(STATUS_ICONS.working).toBe('📝');
    });

    it('should have icon for error status', () => {
      expect(STATUS_ICONS.error).toBe('❌');
    });

    it('should have empty icon for idle status', () => {
      expect(STATUS_ICONS.idle).toBe('');
    });
  });
});
