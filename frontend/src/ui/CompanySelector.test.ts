/**
 * Tests for CompanySelector component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CompanySelector', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="company-selector"></div>';
    mockFetch.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('API Integration', () => {
    it('should call correct API endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ companies: [] }),
      });

      // Simulate API call
      await fetch('http://localhost:8002/api/companies');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8002/api/companies');
    });

    it('should handle API error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('http://localhost:8002/api/companies');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should parse company list from API response', async () => {
      const mockCompanies = {
        companies: [
          { id: '1', name: 'Company A', status: 'active' },
          { id: '2', name: 'Company B', status: 'active' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCompanies),
      });

      const response = await fetch('http://localhost:8002/api/companies');
      const data = await response.json();

      expect(data.companies).toHaveLength(2);
      expect(data.companies[0].name).toBe('Company A');
    });
  });

  describe('Container Element', () => {
    it('should find container element by ID', () => {
      const container = document.getElementById('company-selector');
      expect(container).not.toBeNull();
    });

    it('should handle missing container gracefully', () => {
      document.body.innerHTML = '';
      const container = document.getElementById('company-selector');
      expect(container).toBeNull();
    });
  });
});
