# Comprehensive Fix: Catalog Search & Filter Architecture

## Problem Summary
When searching for "omega-3" and clicking on the "Omega-3 Fish Oil" ingredient suggestion:
- Sidebar shows 17 products (correct count)
- Main area shows only 12 products
- Some visible products don't even contain omega-3

## Root Cause: Dual Filtering Systems Without Coordination

The catalog page has **two independent filtering systems** that manipulate the same DOM elements without coordination:

### 1. SearchBar.astro
- Has its own `productCards` NodeList (cached at load)
- Has `performFullSearch()` that filters by API results
- Has `resetFilters()` that shows all products
- Tracks state via `isSearchActive` flag

### 2. FilterDrawer.astro
- Has its own `productCards` NodeList (cached at load)
- Has `applyFilters()` that filters by category/dosage/ingredients
- Tracks state via `currentCategory`, `currentDosage`, `selectedIngredients`

### The Conflict
Both components manipulate `element.style.display` directly. When one component hides products and another shows them (or vice versa), they fight over DOM state with no awareness of each other.

## Architecture Problems

### Problem 1: No Single Source of Truth
Each component maintains separate state:
- SearchBar: `isSearchActive`, `currentQuery`, cached `productCards`
- FilterDrawer: `currentCategory`, `currentDosage`, `selectedIngredients`, cached `productCards`

### Problem 2: Cached DOM References
Both components cache NodeLists at initialization:
```javascript
const productCards = document.querySelectorAll('article[data-product]');
```
This can miss elements or operate on stale references.

### Problem 3: No Filter Composition
When clicking an ingredient suggestion:
1. SearchBar calls `window.addIngredientFilter()`
2. FilterDrawer's `applyFilters()` runs
3. But SearchBar's previous visibility changes may persist
4. There's no mechanism to combine API search results WITH ingredient filters

## Solution: Centralized Filter State Manager

Create a **single global filter state manager** that:
1. Holds all filter state in one place
2. Applies ALL filters together in one pass
3. Re-queries DOM fresh each time (no caching)
4. Emits events for UI updates

### Implementation

#### Step 1: Create Global Filter State (`src/components/catalog/CatalogFilterState.astro`)

```javascript
// Global filter state - single source of truth
window.catalogFilterState = {
  // State
  searchQuery: '',
  searchResultSlugs: null, // Set<string> or null
  category: 'all',
  dosageForm: 'all',
  ingredients: [],
  matchAllIngredients: false,

  // Ingredient alias mappings (moved here)
  ingredientAliases: { ... },

  // Apply all filters - THE ONLY place that manipulates visibility
  applyAllFilters() {
    const cards = document.querySelectorAll('article[data-product]');
    const sections = document.querySelectorAll('section[data-category]');
    let visibleCount = 0;

    cards.forEach(card => {
      const visible = this.cardMatchesAllFilters(card);
      (card as HTMLElement).style.display = visible ? 'grid' : 'none';
      if (visible) visibleCount++;
    });

    // Update section visibility
    sections.forEach(section => {
      const hasVisible = Array.from(section.querySelectorAll('article[data-product]'))
        .some(card => (card as HTMLElement).style.display !== 'none');
      (section as HTMLElement).style.display = hasVisible ? 'block' : 'none';

      // Update count badge
      const countSpan = section.querySelector('.category-product-count');
      if (countSpan) {
        const visible = section.querySelectorAll('article[data-product]:not([style*="display: none"])').length;
        countSpan.innerHTML = `<span class="count-value">${visible}</span> ${visible === 1 ? 'product' : 'products'}`;
      }
    });

    // Emit event for UI components to update
    window.dispatchEvent(new CustomEvent('catalogFiltersChanged', {
      detail: { visibleCount, filters: this.getActiveFilters() }
    }));

    return visibleCount;
  },

  cardMatchesAllFilters(card) {
    // 1. Check search results (if active)
    if (this.searchResultSlugs) {
      const slug = card.getAttribute('data-product');
      if (!this.searchResultSlugs.has(slug)) return false;
    }

    // 2. Check category
    if (this.category !== 'all') {
      if (card.getAttribute('data-category') !== this.category) return false;
    }

    // 3. Check dosage form
    if (this.dosageForm !== 'all') {
      if (card.getAttribute('data-dosage') !== this.dosageForm) return false;
    }

    // 4. Check ingredients
    if (this.ingredients.length > 0) {
      if (!this.cardMatchesIngredientFilter(card)) return false;
    }

    return true;
  },

  // ... ingredient matching logic moved here ...

  // Public API methods
  setSearchResults(query, slugs) {
    this.searchQuery = query;
    this.searchResultSlugs = slugs ? new Set(slugs) : null;
    return this.applyAllFilters();
  },

  clearSearch() {
    this.searchQuery = '';
    this.searchResultSlugs = null;
    return this.applyAllFilters();
  },

  setCategory(category) {
    this.category = category;
    return this.applyAllFilters();
  },

  setDosageForm(dosageForm) {
    this.dosageForm = dosageForm;
    return this.applyAllFilters();
  },

  addIngredient(ingredient) {
    if (!this.ingredients.includes(ingredient)) {
      this.ingredients.push(ingredient);
      return this.applyAllFilters();
    }
    return -1; // No change
  },

  removeIngredient(ingredient) {
    const idx = this.ingredients.indexOf(ingredient);
    if (idx > -1) {
      this.ingredients.splice(idx, 1);
      return this.applyAllFilters();
    }
    return -1;
  },

  clearIngredients() {
    this.ingredients = [];
    return this.applyAllFilters();
  },

  clearAll() {
    this.searchQuery = '';
    this.searchResultSlugs = null;
    this.category = 'all';
    this.dosageForm = 'all';
    this.ingredients = [];
    this.matchAllIngredients = false;
    return this.applyAllFilters();
  },

  getActiveFilters() {
    return {
      hasSearch: !!this.searchResultSlugs,
      searchQuery: this.searchQuery,
      category: this.category,
      dosageForm: this.dosageForm,
      ingredients: [...this.ingredients],
      matchAllIngredients: this.matchAllIngredients
    };
  }
};
```

#### Step 2: Update SearchBar.astro

Remove all direct DOM manipulation. Instead:

```javascript
// When user clicks ingredient suggestion
function filterByIngredient(ingredient: string) {
  hideDropdown();
  if (searchInput) searchInput.value = '';
  showClearBtn(false);

  // Use centralized state
  window.catalogFilterState.clearSearch(); // Clear any active search first
  window.catalogFilterState.addIngredient(ingredient);
}

// When performing full search
async function performFullSearch(query: string) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  const slugs = data.results.map(r => r.slug);

  // Use centralized state
  const count = window.catalogFilterState.setSearchResults(query, slugs);
  showResultsBanner(count, query);
}

// When clearing search
function clearSearch() {
  window.catalogFilterState.clearSearch();
  hideResultsBanner();
}

// Listen for filter changes to update UI
window.addEventListener('catalogFiltersChanged', (e) => {
  const { visibleCount } = e.detail;
  // Update any SearchBar-specific UI
});
```

#### Step 3: Update FilterDrawer.astro

Remove direct DOM manipulation. Instead:

```javascript
// When category changes
categoryRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    window.catalogFilterState.setCategory(e.target.value);
  });
});

// When dosage form changes
dosageRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    window.catalogFilterState.setDosageForm(e.target.value);
  });
});

// When ingredient selected
function selectIngredient(ingredient: string) {
  window.catalogFilterState.addIngredient(ingredient);
  renderSelectedIngredients(); // Update UI chips
}

// Listen for filter changes to update UI
window.addEventListener('catalogFiltersChanged', (e) => {
  const { visibleCount, filters } = e.detail;

  // Update drawer product count
  if (productCountEl) {
    productCountEl.textContent = visibleCount.toString();
  }

  // Update filter badge
  updateBadge(filters);

  // Sync selected ingredients display
  selectedIngredients = filters.ingredients;
  renderSelectedIngredients();
});
```

## Files to Modify

1. **NEW: `src/components/catalog/CatalogFilterState.astro`**
   - Create centralized filter state manager
   - Include all filtering logic
   - Export global `window.catalogFilterState`

2. **`src/pages/catalog.astro`**
   - Import CatalogFilterState before SearchBar and FilterDrawer

3. **`src/components/catalog/SearchBar.astro`**
   - Remove `productCards`, `categorySections` caching
   - Remove `resetFilters()` function
   - Remove direct DOM manipulation in `performFullSearch()`
   - Update `filterByIngredient()` to use centralized state
   - Add event listener for `catalogFiltersChanged`

4. **`src/components/catalog/FilterDrawer.astro`**
   - Remove `productCards`, `categorySections` caching
   - Remove `applyFilters()` function
   - Remove `matchesIngredientFilter()` function
   - Move `ingredientAliases` to CatalogFilterState
   - Update all filter handlers to use centralized state
   - Add event listener for `catalogFiltersChanged`

## Key Benefits

1. **Single Source of Truth** - All filter state in one place
2. **Composable Filters** - Search + category + ingredients all work together
3. **Fresh DOM Queries** - No stale NodeList references
4. **Event-Driven UI** - Components react to state changes, not each other
5. **Testable** - Filter logic isolated and can be unit tested
6. **Extensible** - Easy to add new filter types

## Migration Strategy

1. Create CatalogFilterState with full implementation
2. Update SearchBar to use centralized state (search + ingredient selection)
3. Update FilterDrawer to use centralized state (category + dosage + ingredient management)
4. Remove duplicate code from both components
5. Test all filter combinations thoroughly
