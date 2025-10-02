/**
 * View Mode Store
 * Manages the view mode state (single or grid) across components
 */

class ViewModeStore {
  viewMode = $state("single");
  loading = $state(false);

  toggle() {
    this.viewMode = this.viewMode === "single" ? "grid" : "single";
  }

  setViewMode(mode) {
    this.viewMode = mode;
  }

  setLoading(isLoading) {
    this.loading = isLoading;
  }
}

export const viewModeStore = new ViewModeStore();

