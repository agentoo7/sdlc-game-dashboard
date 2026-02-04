import { apiService } from '@/services/ApiService';
import type { Company } from '@/types';

export class CompanySelector {
  private container: HTMLElement;
  private companies: Company[] = [];
  private selectedCompanyId: string | null = null;
  private onSelectCallback: ((companyId: string) => void) | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = container;
  }

  async init(): Promise<void> {
    await this.loadCompanies();
    this.render();
  }

  onSelect(callback: (companyId: string) => void): void {
    this.onSelectCallback = callback;
  }

  getSelectedCompanyId(): string | null {
    return this.selectedCompanyId;
  }

  private async loadCompanies(): Promise<void> {
    try {
      this.companies = await apiService.getCompanies();
      // Auto-select first company if none selected
      if (this.companies.length > 0 && !this.selectedCompanyId) {
        this.selectedCompanyId = this.companies[0].company_id;
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
      this.companies = [];
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="flex items-center h-full px-4 gap-3 overflow-x-auto">
        <span class="text-sm font-semibold text-slate-400 whitespace-nowrap">TEAMS:</span>
        <div class="flex gap-3" id="company-cards">
          ${this.companies.length === 0 ? this.renderEmptyState() : this.renderCompanyCards()}
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
