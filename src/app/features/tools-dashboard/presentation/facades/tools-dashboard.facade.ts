import { computed, inject, Injectable, signal } from '@angular/core';
import { form, maxLength, PathKind, required, SchemaPathTree } from '@angular/forms/signals';
import { FilterToolsUseCase, GetToolsUseCase } from '../../application';
import { Tool, TOOL_CATEGORIES, ToolCategory, ToolFilter } from '../../domain';

export interface ToolsDashboardState {
  searchQuery: string;
  category: ToolCategory | 'todas';
  tools: Tool[];
  isLoading: boolean;
}

const toolsDashboardFormValidation = (
  schema: SchemaPathTree<ToolsDashboardState, PathKind.Root>,
) => {
  required(schema.searchQuery);
  maxLength(schema.searchQuery, 100);
  required(schema.category);
};

@Injectable()
export class ToolsDashboardFacade {
  private readonly getToolsUseCase = inject(GetToolsUseCase);
  private readonly filterToolsUseCase = inject(FilterToolsUseCase);

  readonly categories = TOOL_CATEGORIES;

  protected readonly _state = signal<ToolsDashboardState>({
    searchQuery: '',
    category: 'todas',
    tools: [],
    isLoading: true,
  });

  public readonly toolsDashboardForm = form(this._state, toolsDashboardFormValidation);

  readonly searchQuery = computed(() => this._state().searchQuery);
  readonly category = computed(() => this._state().category);
  readonly tools = computed(() => this._state().tools);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly toolCount = computed(() => this._state().tools.length);

  readonly filteredTools = computed(() => {
    const tools = this.tools();
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.category();

    return tools.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query);

      const matchesCategory = category === 'todas' || tool.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  async loadTools(): Promise<void> {
    this._state.update((s) => ({ ...s, isLoading: true }));
    try {
      const tools = await this.getToolsUseCase.execute();
      this._state.update((s) => ({ ...s, tools, isLoading: false }));
    } catch {
      this._state.update((s) => ({ ...s, isLoading: false }));
    }
  }

  updateSearch(query: string): void {
    this._state.update((s) => ({ ...s, searchQuery: query }));
    this.applyFilter();
  }

  updateCategory(category: ToolCategory | 'todas'): void {
    this._state.update((s) => ({ ...s, category }));
    this.applyFilter();
  }

  private async applyFilter(): Promise<void> {
    const state = this._state();
    const filter: ToolFilter = {
      searchQuery: state.searchQuery,
      category: state.category,
    };

    const tools = await this.filterToolsUseCase.execute(filter);
    this._state.update((s) => ({ ...s, tools }));
  }
}
