import { apiService } from '@/services/ApiService';
import type { Company } from '@/types';

export class CompanySelector {
  private container: HTMLElement;
  private companies: Company[] = [];
  private selectedCompanyId: string | null = null;
  private onSelectCallback: ((companyId: string) => void) | null = null;
  private isLoading = false;
  private loadError: string | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = container;
  }

  async init(): Promise<void> {
    this.isLoading = true;
    this.render();
    await this.loadCompanies();
    this.isLoading = false;
    this.render();
  }

  onSelect(callback: (companyId: string) => void): void {
    this.onSelectCallback = callback;
  }

  getSelectedCompanyId(): string | null {
    return this.selectedCompanyId;
  }

  private async loadCompanies(): Promise<void> {
    this.loadError = null;
    try {
      this.companies = await apiService.getCompanies();
      // Auto-select first company if none selected
      if (this.companies.length > 0 && !this.selectedCompanyId) {
        this.selectedCompanyId = this.companies[0].company_id;
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
      this.loadError = error instanceof Error ? error.message : 'Failed to load teams';
      this.companies = [];
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="flex items-center h-full px-4 gap-3 overflow-x-auto">
        <span class="text-sm font-semibold text-slate-400 whitespace-nowrap">TEAMS:</span>
        <div class="flex gap-3" id="company-cards">
          ${this.renderContent()}
        </div>
      </div>
    `;

    // Attach click handlers
    this.container.querySelectorAll('.company-card').forEach((card) => {
      card.addEventListener('click', () => {
        const companyId = card.getAttribute('data-company-id');
        if (companyId) {
          this.selectCompany(companyId);
        }
      });
    });
  }

  private renderContent(): string {
    if (this.isLoading) {
      return this.renderLoadingState();
    }
    if (this.loadError) {
      return this.renderErrorState();
    }
    if (this.companies.length === 0) {
      return this.renderEmptyState();
    }
    return this.renderCompanyCards();
  }

  private renderLoadingState(): string {
    return `
      <div class="text-slate-400 text-sm flex items-center gap-2">
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading teams...
      </div>
    `;
  }

  private renderErrorState(): string {
    return `
      <div class="text-red-400 text-sm flex items-center gap-2">
        <span>Failed to load teams</span>
        <button class="text-amber-400 hover:text-amber-300 underline" id="retry-btn">Retry</button>
      </div>
    `;
  }

  private renderEmptyState(): string {
    return `
      <div class="text-slate-500 text-sm italic">
        No teams registered. Use the API to register teams.
      </div>
    `;
  }

  private renderCompanyCards(): string {
    return this.companies
      .map((company) => {
        const isSelected = company.company_id === this.selectedCompanyId;
        const borderClass = isSelected
          ? 'border-amber-500 bg-amber-500/10'
          : 'border-slate-600 hover:border-slate-500';

        return `
          <div
            class="company-card cursor-pointer px-4 py-2 rounded-lg border-2 ${borderClass} transition-all duration-150"
            data-company-id="${company.company_id}"
          >
            <div class="font-semibold text-sm text-slate-100">${company.name}</div>
            <div class="text-xs text-slate-400">
              ${company.agent_count} agent${company.agent_count !== 1 ? 's' : ''}
              ${company.status ? `• ${company.status}` : ''}
            </div>
          </div>
        `;
      })
      .join('');
  }

  private selectCompany(companyId: string): void {
    if (companyId === this.selectedCompanyId) return;

    this.selectedCompanyId = companyId;
    this.render();

    if (this.onSelectCallback) {
      this.onSelectCallback(companyId);
    }
  }

  async refresh(): Promise<void> {
    await this.loadCompanies();
    this.render();
  }
}
