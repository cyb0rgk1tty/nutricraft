# Product Catalog Page - Complete Implementation Guide

## For AI Coding Agent

This document contains everything needed to build a password-protected, single-page scrollable product catalog for an Astro-based website. It includes the PRD, all component code, styling, and data structure.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technical Requirements](#2-technical-requirements)
3. [File Structure](#3-file-structure)
4. [Visual Design Reference](#4-visual-design-reference)
5. [Component Code](#5-component-code)
6. [Data Structure](#6-data-structure)
7. [Styling](#7-styling)
8. [Implementation Steps](#8-implementation-steps)
9. [Testing Checklist](#9-testing-checklist)

---

## 1. Overview

### 1.1 Purpose

Build a password-protected product catalog page that displays supplement products in a single-page, scrollable format. Each product shows a Supplement Facts label image alongside the product name and description. The page includes category filtering functionality.

### 1.2 Goals

- Create a dedicated `/catalog` page within the existing Astro website
- Implement simple password protection to restrict access
- Display ~100 products organized by category
- Allow filtering by product category
- Present all product information without requiring click-through (single-page scroll)
- Support uploaded Supplement Facts label images

### 1.3 Target Users

- Internal team members
- Authorized partners and distributors
- Clients reviewing formulation options

---

## 2. Technical Requirements

### 2.1 Framework & Dependencies

```
Framework: Astro (existing site)
Styling: Scoped CSS with CSS custom properties
Data: JSON file for product data
Images: Static assets in /public/labels/
Authentication: Client-side password gate using sessionStorage
```

### 2.2 Key Features

| Feature | Implementation |
|---------|----------------|
| Password Protection | Client-side with sessionStorage persistence |
| Category Filtering | Client-side JavaScript, no page reload |
| Product Display | Side-by-side layout (label + info) |
| Responsive | Mobile-first, stacks on small screens |
| Image Loading | Lazy loading for performance |

---

## 3. File Structure

```
src/
├── pages/
│   └── catalog.astro                 # Main catalog page
├── components/
│   └── catalog/
│       ├── PasswordGate.astro        # Password protection wrapper
│       ├── CatalogHero.astro         # Hero banner section
│       ├── FilterBar.astro           # Sticky category filter tabs
│       ├── CategorySection.astro     # Groups products by category
│       └── ProductRow.astro          # Individual product display
├── data/
│   └── products.json                 # Product data file
├── styles/
│   └── catalog-variables.css         # CSS custom properties
public/
└── labels/                           # Supplement Facts images
    ├── calm-support.png
    ├── deep-sleep-formula.png
    └── ... (all product label images)
```

---

## 4. Visual Design Reference

### 4.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (existing site header)                                   │
├─────────────────────────────────────────────────────────────────┤
│ HERO SECTION                                                    │
│   - Title: "Product Catalog"                                    │
│   - Subtitle: "Evidence-based supplement formulations..."       │
│   - Green gradient background with subtle pattern               │
├─────────────────────────────────────────────────────────────────┤
│ FILTER BAR (sticky on scroll)                                   │
│   [All] [Sleep] [Energy] [Immunity] [Cognitive] [Digestive]...  │
│   "Showing X products"                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ══ Sleep & Relaxation (2 products) ═══════════════════════════  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ┌──────────┐  Product Name                                  │ │
│ │ │          │  ◦ 2 Capsules  ◦ 45 servings  [Sleep]          │ │
│ │ │  LABEL   │                                                │ │
│ │ │  IMAGE   │  Description text goes here describing         │ │
│ │ │ (280px)  │  the product benefits and key ingredients.     │ │
│ │ └──────────┘                                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ (Next product in category...)                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ══ Energy & Performance (3 products) ═════════════════════════  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ (Products continue...)                                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER (existing site footer)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Product Row Layout - Desktop (≥768px)

```
┌────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐   PRODUCT NAME                                │
│  │                 │   ◦ 2 Capsules  ◦ 45 servings  [Category]     │
│  │   SUPPLEMENT    │                                               │
│  │     FACTS       │   Product description text that explains      │
│  │     LABEL       │   the benefits, key ingredients, and ideal    │
│  │    (280px)      │   use case for this supplement formula.       │
│  │                 │                                               │
│  └─────────────────┘                                               │
└────────────────────────────────────────────────────────────────────┘

Grid: grid-template-columns: 280px 1fr;
Gap: 2rem
Padding: 1.5rem
Border-radius: 12px
```

### 4.3 Product Row Layout - Mobile (<768px)

```
┌──────────────────────────────┐
│  ┌────────────────────────┐  │
│  │                        │  │
│  │   SUPPLEMENT FACTS     │  │
│  │       LABEL            │  │
│  │     (centered)         │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  PRODUCT NAME                │
│  ◦ 2 Capsules                │
│  ◦ 45 servings               │
│  [Category Badge]            │
│                              │
│  Product description text    │
│  continues here...           │
└──────────────────────────────┘

Grid: grid-template-columns: 1fr;
Label max-width: 280px (centered)
```

### 4.4 Password Gate Modal

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    (Green gradient background)                  │
│                                                                 │
│              ┌─────────────────────────────────┐                │
│              │           🔒                    │                │
│              │                                 │                │
│              │     Product Catalog             │                │
│              │                                 │                │
│              │  Please enter the password      │                │
│              │  to access the catalog.         │                │
│              │                                 │                │
│              │  ┌─────────────────────┐ ┌───┐  │                │
│              │  │ Enter password      │ │ → │  │                │
│              │  └─────────────────────┘ └───┘  │                │
│              │                                 │                │
│              └─────────────────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Code

### 5.1 Main Page - `src/pages/catalog.astro`

```astro
---
/**
 * Product Catalog Page
 * Password-protected, single-page scrollable catalog
 */
import Layout from '../layouts/Layout.astro';
import PasswordGate from '../components/catalog/PasswordGate.astro';
import CatalogHero from '../components/catalog/CatalogHero.astro';
import FilterBar from '../components/catalog/FilterBar.astro';
import CategorySection from '../components/catalog/CategorySection.astro';
import productsData from '../data/products.json';

const { categories, products } = productsData;

// Group products by category for rendering
const productsByCategory = categories.map(category => ({
  ...category,
  products: products.filter(p => p.category === category.key)
})).filter(cat => cat.products.length > 0);
---

<Layout title="Product Catalog | Nutricraft Labs">
  <PasswordGate>
    <CatalogHero />
    <main class="catalog-main">
      <FilterBar categories={categories} totalProducts={products.length} />
      <div class="catalog-container">
        <div id="catalog-products">
          {productsByCategory.map((category) => (
            <CategorySection 
              category={{ key: category.key, label: category.label }}
              products={category.products}
            />
          ))}
        </div>
        
        <!-- Empty state for filtering -->
        <div id="empty-state" class="empty-state hidden">
          <h3>No products found</h3>
          <p>Try selecting a different category.</p>
        </div>
      </div>
    </main>
  </PasswordGate>
</Layout>

<style>
  .catalog-main {
    min-height: 100vh;
    background-color: var(--color-bg);
  }

  .catalog-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 4rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--color-text-muted);
  }

  .empty-state h3 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .hidden {
    display: none;
  }

  @media (max-width: 768px) {
    .catalog-container {
      padding: 0 1rem 3rem;
    }
  }
</style>
```

---

### 5.2 Password Gate - `src/components/catalog/PasswordGate.astro`

```astro
---
/**
 * PasswordGate Component
 * Simple client-side password protection using sessionStorage
 */

// Password from environment variable with fallback
const CATALOG_PASSWORD = import.meta.env.CATALOG_PASSWORD || 'nutricraft2025';
---

<div id="password-gate" class="password-gate">
  <div class="password-overlay"></div>
  <div class="password-modal">
    <div class="modal-icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    </div>
    <h2>Product Catalog</h2>
    <p>Please enter the password to access the catalog.</p>
    <form id="password-form">
      <div class="input-wrapper">
        <input 
          type="password" 
          id="password-input" 
          placeholder="Enter password"
          autocomplete="off"
          required
        />
        <button type="submit" class="submit-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
      <p id="password-error" class="error hidden">Incorrect password. Please try again.</p>
    </form>
  </div>
</div>

<div id="catalog-content" class="catalog-content hidden">
  <slot />
</div>

<script define:vars={{ password: CATALOG_PASSWORD }}>
  const CORRECT_PASSWORD = password;
  const STORAGE_KEY = 'nutricraft_catalog_auth';

  function checkAuth() {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  }

  function showCatalog() {
    document.getElementById('password-gate').classList.add('hidden');
    document.getElementById('catalog-content').classList.remove('hidden');
  }

  function showError() {
    const errorEl = document.getElementById('password-error');
    const inputEl = document.getElementById('password-input');
    errorEl.classList.remove('hidden');
    inputEl.classList.add('error-state');
    inputEl.value = '';
    inputEl.focus();
  }

  function hideError() {
    document.getElementById('password-error').classList.add('hidden');
    document.getElementById('password-input').classList.remove('error-state');
  }

  // Check if already authenticated on page load
  if (checkAuth()) {
    showCatalog();
  }

  // Handle form submission
  document.getElementById('password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('password-input').value;
    
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      showCatalog();
    } else {
      showError();
    }
  });

  // Hide error on input change
  document.getElementById('password-input').addEventListener('input', hideError);
</script>

<style>
  .password-gate {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .password-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
  }

  .password-modal {
    position: relative;
    background: var(--color-white);
    border-radius: 16px;
    padding: 3rem;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .modal-icon {
    width: 60px;
    height: 60px;
    background: var(--color-accent-pale);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }

  .modal-icon svg {
    width: 28px;
    height: 28px;
    color: var(--color-accent);
  }

  .password-modal h2 {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .password-modal > p {
    color: var(--color-text-muted);
    font-size: 0.95rem;
    margin-bottom: 2rem;
  }

  .input-wrapper {
    display: flex;
    gap: 0.5rem;
  }

  #password-input {
    flex: 1;
    padding: 0.875rem 1rem;
    border: 2px solid var(--color-border);
    border-radius: 10px;
    font-size: 1rem;
    font-family: var(--font-body);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  #password-input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-pale);
  }

  #password-input.error-state {
    border-color: #dc3545;
  }

  .submit-btn {
    padding: 0.875rem 1.25rem;
    background: var(--color-accent);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }

  .submit-btn:hover {
    background: var(--color-accent-light);
  }

  .submit-btn:active {
    transform: scale(0.98);
  }

  .submit-btn svg {
    width: 20px;
    height: 20px;
    color: white;
  }

  .error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 1rem;
  }

  .hidden {
    display: none !important;
  }

  .catalog-content {
    display: block;
  }
</style>
```

---

### 5.3 Hero Section - `src/components/catalog/CatalogHero.astro`

```astro
---
/**
 * CatalogHero Component
 * Hero section for the catalog page
 */

interface Props {
  title?: string;
  subtitle?: string;
}

const { 
  title = "Product Catalog",
  subtitle = "Evidence-based supplement formulations designed for optimal efficacy and regulatory compliance."
} = Astro.props;
---

<section class="hero">
  <div class="hero-pattern"></div>
  <div class="hero-content">
    <h1>{title}</h1>
    <p>{subtitle}</p>
  </div>
</section>

<style>
  .hero {
    background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
    padding: 4rem 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .hero-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 700px;
    margin: 0 auto;
  }

  .hero h1 {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-white);
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
  }

  .hero p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.85);
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .hero {
      padding: 3rem 1.5rem;
    }

    .hero h1 {
      font-size: 2rem;
    }

    .hero p {
      font-size: 1rem;
    }
  }
</style>
```

---

### 5.4 Filter Bar - `src/components/catalog/FilterBar.astro`

```astro
---
/**
 * FilterBar Component
 * Sticky filter bar with category tabs and product count
 */

interface Category {
  key: string;
  label: string;
}

interface Props {
  categories: Category[];
  totalProducts: number;
}

const { categories, totalProducts } = Astro.props;
---

<div class="filter-bar">
  <div class="filter-bar-inner">
    <div class="filter-tabs" role="tablist" aria-label="Filter products by category">
      <button 
        class="filter-tab active" 
        data-category="all"
        role="tab"
        aria-selected="true"
        aria-controls="catalog-products"
      >
        All Products
      </button>
      {categories.map((category) => (
        <button 
          class="filter-tab" 
          data-category={category.key}
          role="tab"
          aria-selected="false"
          aria-controls="catalog-products"
        >
          {category.label}
        </button>
      ))}
    </div>
    <div class="product-count">
      Showing <strong id="visible-count">{totalProducts}</strong> products
    </div>
  </div>
</div>

<script>
  function initFilterBar() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const categorySections = document.querySelectorAll('.category-section');
    const productRows = document.querySelectorAll('.product-row');
    const visibleCountEl = document.getElementById('visible-count');
    const emptyState = document.getElementById('empty-state');
    const catalogProducts = document.getElementById('catalog-products');

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const selectedCategory = tab.dataset.category;
        let visibleCount = 0;

        if (selectedCategory === 'all') {
          // Show all sections and products
          categorySections.forEach(section => {
            (section as HTMLElement).style.display = 'block';
          });
          productRows.forEach(row => {
            (row as HTMLElement).style.display = 'grid';
            visibleCount++;
          });
        } else {
          // Filter by category
          categorySections.forEach(section => {
            const sectionCategory = (section as HTMLElement).dataset.category;
            if (sectionCategory === selectedCategory) {
              (section as HTMLElement).style.display = 'block';
            } else {
              (section as HTMLElement).style.display = 'none';
            }
          });

          productRows.forEach(row => {
            const rowCategory = (row as HTMLElement).dataset.category;
            if (rowCategory === selectedCategory) {
              (row as HTMLElement).style.display = 'grid';
              visibleCount++;
            } else {
              (row as HTMLElement).style.display = 'none';
            }
          });
        }

        // Update count
        if (visibleCountEl) {
          visibleCountEl.textContent = visibleCount.toString();
        }

        // Show/hide empty state
        if (emptyState && catalogProducts) {
          if (visibleCount === 0) {
            emptyState.classList.remove('hidden');
            catalogProducts.classList.add('hidden');
          } else {
            emptyState.classList.add('hidden');
            catalogProducts.classList.remove('hidden');
          }
        }
      });
    });
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', initFilterBar);
  
  // Re-initialize if content changes (for view transitions)
  document.addEventListener('astro:page-load', initFilterBar);
</script>

<style>
  .filter-bar {
    position: sticky;
    top: 0;
    background: var(--color-bg);
    padding: 1.5rem 0;
    z-index: 90;
    border-bottom: 1px solid var(--color-border);
  }

  .filter-bar-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filter-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-tab {
    padding: 0.6rem 1.25rem;
    border: 1px solid var(--color-border);
    background: var(--color-white);
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-body);
  }

  .filter-tab:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .filter-tab:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--color-accent-pale);
  }

  .filter-tab.active {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: var(--color-white);
  }

  .product-count {
    text-align: center;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .product-count strong {
    color: var(--color-text);
  }

  @media (max-width: 768px) {
    .filter-bar-inner {
      padding: 0 1rem;
    }

    .filter-tabs {
      justify-content: flex-start;
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 0.5rem;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .filter-tabs::-webkit-scrollbar {
      display: none;
    }

    .filter-tab {
      flex-shrink: 0;
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }
  }
</style>
```

---

### 5.5 Category Section - `src/components/catalog/CategorySection.astro`

```astro
---
/**
 * CategorySection Component
 * Groups products under a category header with product count
 */

import ProductRow from './ProductRow.astro';

interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  servingSize: string;
  servingsPerContainer: number;
  labelImage: string;
}

interface Category {
  key: string;
  label: string;
}

interface Props {
  category: Category;
  products: Product[];
}

const { category, products } = Astro.props;
---

<section class="category-section" data-category={category.key} id={`category-${category.key}`}>
  <header class="category-header">
    <h2>{category.label}</h2>
    <span class="category-count">{products.length} {products.length === 1 ? 'product' : 'products'}</span>
  </header>
  
  <div class="product-list">
    {products.map((product) => (
      <ProductRow product={product} />
    ))}
  </div>
</section>

<style>
  .category-section {
    margin-bottom: 3rem;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--color-accent);
  }

  .category-header h2 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-accent);
    margin: 0;
  }

  .category-count {
    background: var(--color-accent-pale);
    color: var(--color-accent);
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
  }

  .product-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .category-section {
      margin-bottom: 2.5rem;
    }

    .category-header {
      flex-wrap: wrap;
    }

    .category-header h2 {
      font-size: 1.25rem;
    }

    .product-list {
      gap: 1.25rem;
    }
  }
</style>
```

---

### 5.6 Product Row - `src/components/catalog/ProductRow.astro`

This is the core component that displays each product with the Supplement Facts label and details.

```astro
---
/**
 * ProductRow Component
 * Displays a single product with Supplement Facts label and details
 * Layout: Label image on left, product info on right (stacks on mobile)
 */

interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  servingSize: string;
  servingsPerContainer: number;
  labelImage: string;
}

interface Props {
  product: Product;
}

const { product } = Astro.props;

// Construct image path - adjust based on your asset structure
const imagePath = product.labelImage || `/labels/${product.id}.png`;
---

<article class="product-row" data-category={product.category} data-product-id={product.id}>
  <!-- Supplement Facts Label Image -->
  <div class="label-container">
    {product.labelImage ? (
      <img 
        src={imagePath}
        alt={`${product.name} Supplement Facts`}
        loading="lazy"
        width="280"
        class="label-image"
      />
    ) : (
      <!-- Fallback placeholder if no image provided -->
      <div class="label-placeholder">
        <div class="placeholder-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <span>Label image coming soon</span>
      </div>
    )}
  </div>

  <!-- Product Information -->
  <div class="product-info">
    <h3 class="product-name">{product.name}</h3>
    
    <div class="product-meta">
      <!-- Serving Size -->
      <span class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.591.659H9.061a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V6a2.25 2.25 0 00-2.25-2.25H7.25A2.25 2.25 0 005 6v8.5" />
        </svg>
        {product.servingSize}
      </span>

      <!-- Servings Per Container -->
      <span class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        {product.servingsPerContainer} servings
      </span>

      <!-- Category Badge -->
      <span class="category-badge">
        {product.categoryLabel}
      </span>
    </div>

    <p class="product-description">{product.description}</p>
  </div>
</article>

<style>
  .product-row {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    background: var(--color-white);
    border-radius: 12px;
    border: 1px solid var(--color-border);
    padding: 1.5rem;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .product-row:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  /* Label Container */
  .label-container {
    background: var(--color-bg-alt);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 280px;
  }

  .label-image {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  /* Placeholder when no image */
  .label-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--color-text-muted);
    text-align: center;
    padding: 2rem;
  }

  .placeholder-icon {
    width: 48px;
    height: 48px;
    background: var(--color-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-icon svg {
    width: 24px;
    height: 24px;
    color: var(--color-text-muted);
  }

  .label-placeholder span {
    font-size: 0.875rem;
  }

  /* Product Info */
  .product-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.75rem;
  }

  .product-name {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  /* Meta Information */
  .product-meta {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 0.25rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .meta-item svg {
    width: 18px;
    height: 18px;
    color: var(--color-accent);
    flex-shrink: 0;
  }

  .category-badge {
    background: var(--color-accent-pale);
    color: var(--color-accent);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.3rem 0.75rem;
    border-radius: 50px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  /* Description */
  .product-description {
    font-size: 1rem;
    color: var(--color-text-muted);
    line-height: 1.7;
    margin: 0;
    margin-top: 0.5rem;
    max-width: 600px;
  }

  /* Responsive - Mobile */
  @media (max-width: 768px) {
    .product-row {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 1.25rem;
    }

    .label-container {
      max-width: 280px;
      margin: 0 auto;
      min-height: auto;
    }

    .product-name {
      font-size: 1.4rem;
    }

    .product-meta {
      gap: 0.75rem;
    }

    .meta-item {
      font-size: 0.85rem;
    }

    .product-description {
      font-size: 0.95rem;
    }
  }

  /* Tablet adjustment */
  @media (min-width: 769px) and (max-width: 1024px) {
    .product-row {
      grid-template-columns: 240px 1fr;
      gap: 1.5rem;
    }

    .product-name {
      font-size: 1.5rem;
    }
  }
</style>
```

---

## 6. Data Structure

### 6.1 Product Schema (TypeScript Interface)

```typescript
interface Product {
  id: string;                    // Unique identifier (kebab-case, matches image filename)
  name: string;                  // Display name
  category: string;              // Category key (kebab-case)
  categoryLabel: string;         // Category display name
  description: string;           // Product description (1-3 sentences)
  servingSize: string;           // e.g., "2 Capsules", "1 Scoop (8g)"
  servingsPerContainer: number;  // e.g., 30, 45, 60
  labelImage: string;            // Path to Supplement Facts image
}

interface Category {
  key: string;                   // Category identifier (kebab-case)
  label: string;                 // Display name
}

interface ProductsData {
  categories: Category[];
  products: Product[];
}
```

### 6.2 Sample `products.json`

```json
{
  "categories": [
    { "key": "sleep-relaxation", "label": "Sleep & Relaxation" },
    { "key": "energy-performance", "label": "Energy & Performance" },
    { "key": "immunity-wellness", "label": "Immunity & Wellness" },
    { "key": "cognitive-support", "label": "Cognitive Support" },
    { "key": "digestive-health", "label": "Digestive Health" },
    { "key": "multivitamins", "label": "Multivitamins" },
    { "key": "specialty", "label": "Specialty Formulas" }
  ],
  "products": [
    {
      "id": "calm-support",
      "name": "Calm Support",
      "category": "sleep-relaxation",
      "categoryLabel": "Sleep & Relaxation",
      "description": "A synergistic blend of magnesium, L-theanine, ashwagandha, and valerian root designed to support relaxation and healthy sleep patterns without morning grogginess.",
      "servingSize": "2 Capsules",
      "servingsPerContainer": 45,
      "labelImage": "/labels/calm-support.png"
    },
    {
      "id": "deep-sleep-formula",
      "name": "Deep Sleep Formula",
      "category": "sleep-relaxation",
      "categoryLabel": "Sleep & Relaxation",
      "description": "Advanced nighttime support featuring melatonin, GABA, and passionflower for restorative sleep without morning grogginess or dependency.",
      "servingSize": "2 Capsules",
      "servingsPerContainer": 30,
      "labelImage": "/labels/deep-sleep-formula.png"
    },
    {
      "id": "energy-ignite",
      "name": "Energy Ignite",
      "category": "energy-performance",
      "categoryLabel": "Energy & Performance",
      "description": "Clean energy formula with natural caffeine from green tea, B-vitamins, and adaptogenic rhodiola for sustained focus without jitters or crash.",
      "servingSize": "1 Capsule",
      "servingsPerContainer": 60,
      "labelImage": "/labels/energy-ignite.png"
    },
    {
      "id": "pre-workout-elite",
      "name": "Pre-Workout Elite",
      "category": "energy-performance",
      "categoryLabel": "Energy & Performance",
      "description": "Class I NPN-compliant pre-workout formula with clinically-dosed citrulline, beta-alanine, and taurine for enhanced athletic performance.",
      "servingSize": "1 Scoop (8g)",
      "servingsPerContainer": 30,
      "labelImage": "/labels/pre-workout-elite.png"
    },
    {
      "id": "immune-defense",
      "name": "Immune Defense",
      "category": "immunity-wellness",
      "categoryLabel": "Immunity & Wellness",
      "description": "Comprehensive immune support featuring vitamin C, zinc, elderberry, and echinacea for year-round wellness and natural defense.",
      "servingSize": "2 Capsules",
      "servingsPerContainer": 45,
      "labelImage": "/labels/immune-defense.png"
    },
    {
      "id": "brain-boost",
      "name": "Brain Boost",
      "category": "cognitive-support",
      "categoryLabel": "Cognitive Support",
      "description": "Premium nootropic formula with lion's mane, bacopa, and phosphatidylserine to support memory, focus, and long-term cognitive health.",
      "servingSize": "2 Capsules",
      "servingsPerContainer": 30,
      "labelImage": "/labels/brain-boost.png"
    },
    {
      "id": "gut-restore",
      "name": "Gut Restore",
      "category": "digestive-health",
      "categoryLabel": "Digestive Health",
      "description": "Multi-strain probiotic with 50 billion CFU from 10 clinically-studied strains plus prebiotic fiber for comprehensive digestive support.",
      "servingSize": "1 Capsule",
      "servingsPerContainer": 30,
      "labelImage": "/labels/gut-restore.png"
    },
    {
      "id": "complete-multi-womens",
      "name": "Complete Multi (Women's)",
      "category": "multivitamins",
      "categoryLabel": "Multivitamins",
      "description": "Iron-free daily multivitamin formulated for women with active methylfolate, bioavailable minerals, and antioxidant support.",
      "servingSize": "2 Capsules",
      "servingsPerContainer": 30,
      "labelImage": "/labels/complete-multi-womens.png"
    }
  ]
}
```

### 6.3 Category Reference

| Key | Display Label |
|-----|---------------|
| `sleep-relaxation` | Sleep & Relaxation |
| `energy-performance` | Energy & Performance |
| `immunity-wellness` | Immunity & Wellness |
| `cognitive-support` | Cognitive Support |
| `digestive-health` | Digestive Health |
| `multivitamins` | Multivitamins |
| `specialty` | Specialty Formulas |

---

## 7. Styling

### 7.1 CSS Variables - `src/styles/catalog-variables.css`

Add these to your global stylesheet or Layout component:

```css
/* Import Google Fonts - Add to your <head> */
/* 
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap" rel="stylesheet">
*/

:root {
  /* Colors */
  --color-bg: #FDFBF7;           /* Page background - warm off-white */
  --color-bg-alt: #F5F1E8;       /* Card/section background */
  --color-text: #1A1A1A;         /* Primary text - near black */
  --color-text-muted: #5C5C5C;   /* Secondary text - dark gray */
  --color-accent: #2D5A4A;       /* Primary accent - forest green */
  --color-accent-light: #3D7A64; /* Lighter accent - gradients/hover */
  --color-accent-pale: #E8F0ED;  /* Very light accent - badges */
  --color-border: #E0DCD3;       /* Borders - warm gray */
  --color-white: #FFFFFF;        /* Pure white */

  /* Typography */
  --font-display: 'Fraunces', serif;    /* Headings */
  --font-body: 'DM Sans', sans-serif;   /* Body text */

  /* Spacing */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 50px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08);

  /* Layout */
  --container-max: 1200px;
}

/* Utility classes */
.hidden {
  display: none !important;
}
```

### 7.2 Font Import

Add to your Layout's `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap" rel="stylesheet">
```

---

## 8. Implementation Steps

### Step 1: Set Up File Structure

```bash
# Create directories
mkdir -p src/components/catalog
mkdir -p src/data
mkdir -p src/styles
mkdir -p public/labels
```

### Step 2: Add CSS Variables

Add the CSS variables from Section 7.1 to your global stylesheet or create `src/styles/catalog-variables.css` and import it in your Layout.

### Step 3: Add Google Fonts

Add the font links from Section 7.2 to your Layout's `<head>`.

### Step 4: Create Components

Create each component file in `src/components/catalog/`:
- `PasswordGate.astro`
- `CatalogHero.astro`
- `FilterBar.astro`
- `CategorySection.astro`
- `ProductRow.astro`

### Step 5: Create Data File

Create `src/data/products.json` with your product data following the schema in Section 6.

### Step 6: Add Label Images

Place all Supplement Facts images in `public/labels/` directory. Name each file using the product's `id` (e.g., `calm-support.png`).

### Step 7: Create Main Page

Create `src/pages/catalog.astro` using the code from Section 5.1.

### Step 8: Set Environment Variable

Add to your `.env` file:

```
CATALOG_PASSWORD=your_secure_password
```

### Step 9: Test

1. Visit `/catalog` - should see password gate
2. Enter wrong password - should see error
3. Enter correct password - should see catalog
4. Refresh page - should remain authenticated (sessionStorage)
5. Test all category filters
6. Test responsive layout on mobile
7. Verify all images load correctly

---

## 9. Testing Checklist

### Functionality
- [ ] Password gate blocks access without correct password
- [ ] Correct password grants access and persists for session
- [ ] "All Products" filter shows all products grouped by category
- [ ] Individual category filters show only matching products
- [ ] Product count updates correctly when filtering
- [ ] All label images load correctly
- [ ] Fallback placeholder shows for missing images

### Responsive Design
- [ ] Desktop (≥1024px): Side-by-side layout works correctly
- [ ] Tablet (768-1023px): Layout adapts appropriately
- [ ] Mobile (<768px): Stacked layout, scrollable filter tabs
- [ ] Filter bar remains sticky on scroll

### Accessibility
- [ ] Keyboard navigation works for filter tabs
- [ ] Screen reader announces content correctly
- [ ] Focus states are visible
- [ ] Alt text on all images

### Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 10. Image Requirements

### Label Image Specifications

| Property | Requirement |
|----------|-------------|
| Format | PNG (preferred) or JPG |
| Minimum Width | 400px |
| Aspect Ratio | ~3:4 (portrait) |
| File Naming | Use product `id` as filename |
| Location | `public/labels/` |

### Example

For a product with `"id": "calm-support"`, the image should be at:
```
public/labels/calm-support.png
```

---

## 11. Environment Variables

### Required

```bash
# .env
CATALOG_PASSWORD=your_secure_password_here
```

### Accessing in Astro

```astro
---
const password = import.meta.env.CATALOG_PASSWORD;
---
```

---

## 12. Deployment Notes

- This implementation uses static site generation (SSG)
- Password validation is client-side only
- No server-side authentication required
- No database required
- SessionStorage clears when browser closes (user must re-enter password)

---

*End of Implementation Guide*