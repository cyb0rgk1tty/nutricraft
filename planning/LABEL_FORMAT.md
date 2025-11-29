# Product Catalog Page - Complete Implementation Guide

## For AI Coding Agent

This document contains everything needed to build a password-protected, single-page scrollable product catalog for an Astro-based website. The Supplement Facts labels are **generated programmatically using HTML/CSS** instead of images.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technical Requirements](#2-technical-requirements)
3. [File Structure](#3-file-structure)
4. [Visual Design Reference](#4-visual-design-reference)
5. [Data Structure](#5-data-structure)
6. [Component Code](#6-component-code)
7. [Styling](#7-styling)
8. [Implementation Steps](#8-implementation-steps)
9. [Testing Checklist](#9-testing-checklist)

---

## 1. Overview

### 1.1 Purpose

Build a password-protected product catalog page that displays supplement products in a single-page, scrollable format. Each product shows a **programmatically generated Supplement Facts label** alongside the product name and description. The page includes category filtering functionality.

### 1.2 Key Difference: Generated Labels vs Images

Instead of uploading Supplement Facts images, the labels are generated from structured data in the `products.json` file. This provides:

- **Easier updates** – Change data, label updates automatically
- **Consistent styling** – All labels look identical
- **Smaller file size** – No images to load
- **Searchable text** – Content is real HTML text
- **Accessibility** – Screen readers can read the content

### 1.3 Goals

- Create a dedicated `/catalog` page within the existing Astro website
- Implement simple password protection to restrict access
- Display ~100 products organized by category
- Allow filtering by product category
- Generate Supplement Facts labels from structured JSON data
- Present all product information without requiring click-through (single-page scroll)

---

## 2. Technical Requirements

### 2.1 Framework & Dependencies

```
Framework: Astro (existing site)
Styling: Scoped CSS with CSS custom properties
Data: JSON file for product data (includes ingredient arrays)
Authentication: Client-side password gate using sessionStorage
Images: None required for labels (generated via HTML/CSS)
```

### 2.2 Key Features

| Feature | Implementation |
|---------|----------------|
| Password Protection | Client-side with sessionStorage persistence |
| Category Filtering | Client-side JavaScript, no page reload |
| Supplement Facts Labels | Generated from JSON data using HTML/CSS |
| Product Display | Side-by-side layout (label + info) |
| Responsive | Mobile-first, stacks on small screens |

---

## 3. File Structure

```
src/
├── pages/
│   └── catalog.astro                    # Main catalog page
├── components/
│   └── catalog/
│       ├── PasswordGate.astro           # Password protection wrapper
│       ├── CatalogHero.astro            # Hero banner section
│       ├── FilterBar.astro              # Sticky category filter tabs
│       ├── CategorySection.astro        # Groups products by category
│       ├── ProductRow.astro             # Individual product display
│       └── SupplementFactsLabel.astro   # Generated label component
├── data/
│   └── products.json                    # Product data with ingredients
└── styles/
    └── catalog-variables.css            # CSS custom properties
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
├─────────────────────────────────────────────────────────────────┤
│ FILTER BAR (sticky on scroll)                                   │
│   [All] [Sleep] [Energy] [Immunity] [Cognitive] [Digestive]...  │
│   "Showing X products"                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ══ Sleep & Relaxation (2 products) ═══════════════════════════  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ┌──────────────────┐  Product Name                          │ │
│ │ │ Supplement Facts │  ◦ 2 Capsules  ◦ 45 servings  [Sleep]  │ │
│ │ │ ──────────────── │                                        │ │
│ │ │ Serving Size: 2  │  Description text goes here describing │ │
│ │ │ Servings: 45     │  the product benefits and ingredients. │ │
│ │ │ ──────────────── │                                        │ │
│ │ │ Magnesium  100mg │                                        │ │
│ │ │ L-Theanine 100mg │                                        │ │
│ │ │ Ashwagandha 150mg│                                        │ │
│ │ │ ──────────────── │                                        │ │
│ │ │ * DV not establ. │                                        │ │
│ │ └──────────────────┘                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER (existing site footer)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Supplement Facts Label Design

```
┌─────────────────────────────────┐
│ Supplement Facts                │  ← Bold 24px header
│─────────────────────────────────│  ← 8px black border
│ Serving Size: 2 Capsules        │
│ Servings Per Container: 45      │
│─────────────────────────────────│  ← 1px border
│ Amount Per Serving      % DV*   │  ← Column headers (9px)
│─────────────────────────────────│
│ Magnesium           100 mg  24% │  ← Ingredient row
│  (as Magnesium Citrate)         │  ← Source (indented)
│─────────────────────────────────│
│ L-Theanine          100 mg   *  │
│─────────────────────────────────│
│ Ashwagandha Extract 150 mg   *  │
│  (5% Withanolides)              │
│─────────────────────────────────│
│ Valerian Root       120 mg   *  │
│  (0.8% Valerenic Acid)          │
│═════════════════════════════════│  ← 4px black border
│ * Daily Value not established.  │  ← Footer (9px)
│                                 │
│ Other Ingredients: Vegetable    │
│ cellulose, rice flour.          │
└─────────────────────────────────┘
```

### 4.3 Product Row Layout - Desktop (≥768px)

```
┌────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐   PRODUCT NAME                                │
│  │                 │   ◦ 2 Capsules  ◦ 45 servings  [Category]     │
│  │   SUPPLEMENT    │                                               │
│  │     FACTS       │   Product description text that explains      │
│  │    (Generated)  │   the benefits, key ingredients, and ideal    │
│  │    (280px)      │   use case for this supplement formula.       │
│  │                 │                                               │
│  └─────────────────┘                                               │
└────────────────────────────────────────────────────────────────────┘

Grid: grid-template-columns: 300px 1fr;
Gap: 2rem
Padding: 1.5rem
```

### 4.4 Product Row Layout - Mobile (<768px)

```
┌──────────────────────────────┐
│  ┌────────────────────────┐  │
│  │    SUPPLEMENT FACTS    │  │
│  │      (Generated)       │  │
│  │      (centered)        │  │
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
```

---

## 5. Data Structure

### 5.1 Product Schema (TypeScript Interface)

```typescript
interface Ingredient {
  name: string;           // e.g., "Magnesium"
  amount: string;         // e.g., "100"
  unit: string;           // e.g., "mg", "mcg", "IU"
  dailyValue?: string;    // e.g., "24%", "*", or omit for "*"
  source?: string;        // e.g., "(as Magnesium Citrate)"
}

interface Product {
  id: string;                    // Unique identifier (kebab-case)
  name: string;                  // Display name
  category: string;              // Category key (kebab-case)
  categoryLabel: string;         // Category display name
  description: string;           // Product description (1-3 sentences)
  servingSize: string;           // e.g., "2 Capsules"
  servingsPerContainer: number;  // e.g., 45
  ingredients: Ingredient[];     // Array of ingredients
  otherIngredients?: string;     // e.g., "Vegetable cellulose, rice flour"
  allergenInfo?: string;         // e.g., "Soy, Tree Nuts"
}

interface Category {
  key: string;
  label: string;
}

interface ProductsData {
  categories: Category[];
  products: Product[];
}
```

### 5.2 Sample `products.json`

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
      "ingredients": [
        {
          "name": "Magnesium",
          "amount": "100",
          "unit": "mg",
          "dailyValue": "24%",
          "source": "(as Magnesium Citrate)"
        },
        {
          "name": "L-Theanine",
          "amount": "100",
          "unit": "mg",
          "dailyValue": "*"
        },
        {
          "name": "Ashwagandha Extract",
          "amount": "150",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(5% Withanolides)"
        },
        {
          "name": "Valerian Root Extract",
          "amount": "120",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(0.8% Valerenic Acid)"
        }
      ],
      "otherIngredients": "Vegetable cellulose (capsule), rice flour, magnesium stearate."
    },
    {
      "id": "deep-sleep-formula",
      "name": "Deep Sleep Formula",
      "category": "sleep-relaxation",
      "categoryLabel": "Sleep & Relaxation",
      "description": "Advanced nighttime support featuring melatonin, GABA, and passionflower for restorative sleep without morning grogginess or dependency.",
      "servingSize": "2 Capsules",
      "servingsPerContainer": 30,
      "ingredients": [
        {
          "name": "Melatonin",
          "amount": "3",
          "unit": "mg",
          "dailyValue": "*"
        },
        {
          "name": "GABA",
          "amount": "200",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(Gamma-Aminobutyric Acid)"
        },
        {
          "name": "Passionflower Extract",
          "amount": "150",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(4:1)"
        },
        {
          "name": "Lemon Balm Extract",
          "amount": "100",
          "unit": "mg",
          "dailyValue": "*"
        }
      ],
      "otherIngredients": "Vegetable cellulose (capsule), rice flour."
    },
    {
      "id": "energy-ignite",
      "name": "Energy Ignite",
      "category": "energy-performance",
      "categoryLabel": "Energy & Performance",
      "description": "Clean energy formula with natural caffeine from green tea, B-vitamins, and adaptogenic rhodiola for sustained focus without jitters or crash.",
      "servingSize": "1 Capsule",
      "servingsPerContainer": 60,
      "ingredients": [
        {
          "name": "Vitamin B12",
          "amount": "500",
          "unit": "mcg",
          "dailyValue": "20833%",
          "source": "(as Methylcobalamin)"
        },
        {
          "name": "Caffeine",
          "amount": "100",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(from Green Tea Extract)"
        },
        {
          "name": "L-Tyrosine",
          "amount": "250",
          "unit": "mg",
          "dailyValue": "*"
        },
        {
          "name": "Rhodiola Rosea Extract",
          "amount": "150",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(3% Rosavins, 1% Salidroside)"
        }
      ],
      "otherIngredients": "Vegetable cellulose (capsule), silicon dioxide."
    },
    {
      "id": "immune-defense",
      "name": "Immune Defense",
      "category": "immunity-wellness",
      "categoryLabel": "Immunity & Wellness",
      "description": "Comprehensive immune support featuring vitamin C, zinc, elderberry, and echinacea for year-round wellness and natural defense.",
      "servingSize": "2 Capsules",
      "servingsPerContainer": 45,
      "ingredients": [
        {
          "name": "Vitamin C",
          "amount": "500",
          "unit": "mg",
          "dailyValue": "556%",
          "source": "(as Ascorbic Acid)"
        },
        {
          "name": "Zinc",
          "amount": "15",
          "unit": "mg",
          "dailyValue": "136%",
          "source": "(as Zinc Citrate)"
        },
        {
          "name": "Elderberry Extract",
          "amount": "200",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(Sambucus nigra, 5:1)"
        },
        {
          "name": "Echinacea Extract",
          "amount": "150",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(Echinacea purpurea)"
        }
      ],
      "otherIngredients": "Vegetable cellulose (capsule), rice flour, silica."
    },
    {
      "id": "brain-boost",
      "name": "Brain Boost",
      "category": "cognitive-support",
      "categoryLabel": "Cognitive Support",
      "description": "Premium nootropic formula with lion's mane, bacopa, and phosphatidylserine to support memory, focus, and long-term cognitive health.",
      "servingSize": "2 Capsules",
      "servingsPerContainer": 30,
      "ingredients": [
        {
          "name": "Lion's Mane Extract",
          "amount": "500",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(30% Polysaccharides)"
        },
        {
          "name": "Bacopa monnieri Extract",
          "amount": "300",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(50% Bacosides)"
        },
        {
          "name": "Phosphatidylserine",
          "amount": "100",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(from Sunflower Lecithin)"
        },
        {
          "name": "Ginkgo biloba Extract",
          "amount": "120",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(24% Glycosides, 6% Terpenes)"
        }
      ],
      "otherIngredients": "Vegetable cellulose (capsule), rice flour, magnesium stearate."
    },
    {
      "id": "gut-restore",
      "name": "Gut Restore",
      "category": "digestive-health",
      "categoryLabel": "Digestive Health",
      "description": "Multi-strain probiotic with 50 billion CFU from 10 clinically-studied strains plus prebiotic fiber for comprehensive digestive support.",
      "servingSize": "1 Capsule",
      "servingsPerContainer": 30,
      "ingredients": [
        {
          "name": "Probiotic Blend",
          "amount": "50",
          "unit": "Billion CFU",
          "dailyValue": "*",
          "source": "(10 Strains)"
        },
        {
          "name": "Prebiotic Fiber",
          "amount": "200",
          "unit": "mg",
          "dailyValue": "*",
          "source": "(FOS - Fructooligosaccharides)"
        },
        {
          "name": "Ginger Root Extract",
          "amount": "100",
          "unit": "mg",
          "dailyValue": "*"
        }
      ],
      "otherIngredients": "Delayed-release vegetable capsule (HPMC, gellan gum), rice maltodextrin."
    },
    {
      "id": "complete-multi-womens",
      "name": "Complete Multi (Women's)",
      "category": "multivitamins",
      "categoryLabel": "Multivitamins",
      "description": "Iron-free daily multivitamin formulated for women with active methylfolate, bioavailable minerals, and antioxidant support.",
      "servingSize": "2 Capsules",
      "servingsPerContainer": 30,
      "ingredients": [
        {
          "name": "Vitamin A",
          "amount": "750",
          "unit": "mcg RAE",
          "dailyValue": "83%",
          "source": "(as Beta-Carotene)"
        },
        {
          "name": "Vitamin C",
          "amount": "250",
          "unit": "mg",
          "dailyValue": "278%",
          "source": "(as Ascorbic Acid)"
        },
        {
          "name": "Vitamin D3",
          "amount": "50",
          "unit": "mcg",
          "dailyValue": "250%",
          "source": "(2000 IU, as Cholecalciferol)"
        },
        {
          "name": "Folate",
          "amount": "400",
          "unit": "mcg DFE",
          "dailyValue": "100%",
          "source": "(as 5-MTHF, Quatrefolic®)"
        },
        {
          "name": "Vitamin B12",
          "amount": "250",
          "unit": "mcg",
          "dailyValue": "10417%",
          "source": "(as Methylcobalamin)"
        },
        {
          "name": "Calcium",
          "amount": "200",
          "unit": "mg",
          "dailyValue": "15%",
          "source": "(as Calcium Citrate)"
        },
        {
          "name": "Magnesium",
          "amount": "100",
          "unit": "mg",
          "dailyValue": "24%",
          "source": "(as Magnesium Bisglycinate)"
        },
        {
          "name": "Zinc",
          "amount": "8",
          "unit": "mg",
          "dailyValue": "73%",
          "source": "(as Zinc Bisglycinate)"
        }
      ],
      "otherIngredients": "Vegetable cellulose (capsule), rice flour, silica, magnesium stearate."
    }
  ]
}
```

### 5.3 Category Reference

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

## 6. Component Code

### 6.1 Main Page - `src/pages/catalog.astro`

```astro
---
/**
 * Product Catalog Page
 * Password-protected, single-page scrollable catalog
 * Supplement Facts labels are generated from JSON data
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

### 6.2 Supplement Facts Label - `src/components/catalog/SupplementFactsLabel.astro`

This is the key component that generates the label from data:

```astro
---
/**
 * SupplementFactsLabel Component
 * Generates a formatted Supplement Facts panel using HTML/CSS
 * Follows FDA/Health Canada label formatting standards
 */

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  dailyValue?: string;
  source?: string;
}

interface Props {
  servingSize: string;
  servingsPerContainer: number;
  ingredients: Ingredient[];
  otherIngredients?: string;
  allergenInfo?: string;
}

const { 
  servingSize, 
  servingsPerContainer, 
  ingredients,
  otherIngredients,
  allergenInfo
} = Astro.props;
---

<div class="supplement-facts">
  <!-- Header -->
  <div class="sf-header">Supplement Facts</div>
  
  <!-- Serving Info -->
  <div class="sf-serving">
    <div class="sf-serving-size">Serving Size: {servingSize}</div>
    <div class="sf-servings-container">Servings Per Container: {servingsPerContainer}</div>
  </div>
  
  <!-- Column Headers -->
  <div class="sf-column-header">
    <span class="sf-col-left"></span>
    <span class="sf-col-amount">Amount Per Serving</span>
    <span class="sf-col-dv">% DV*</span>
  </div>
  
  <!-- Ingredients -->
  <div class="sf-ingredients">
    {ingredients.map((ingredient) => (
      <div class="sf-row">
        <div class="sf-ingredient-info">
          <span class="sf-ingredient-name">{ingredient.name}</span>
          {ingredient.source && (
            <span class="sf-source">{ingredient.source}</span>
          )}
        </div>
        <span class="sf-ingredient-amount">
          {ingredient.amount} {ingredient.unit}
        </span>
        <span class="sf-ingredient-dv">
          {ingredient.dailyValue || '*'}
        </span>
      </div>
    ))}
  </div>
  
  <!-- Footer -->
  <div class="sf-footer">
    <p class="sf-dv-note">* Daily Value not established.</p>
    
    {otherIngredients && (
      <p class="sf-other">
        <strong>Other Ingredients:</strong> {otherIngredients}
      </p>
    )}
    
    {allergenInfo && (
      <p class="sf-allergen">
        <strong>Contains:</strong> {allergenInfo}
      </p>
    )}
  </div>
</div>

<style>
  .supplement-facts {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: #ffffff;
    border: 1px solid #000000;
    padding: 4px 6px;
    width: 100%;
    max-width: 280px;
    font-size: 10px;
    line-height: 1.2;
    color: #000000;
  }

  /* Header */
  .sf-header {
    font-size: 22px;
    font-weight: 900;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    margin-bottom: 1px;
    letter-spacing: -0.5px;
    line-height: 1.1;
  }

  /* Serving Info */
  .sf-serving {
    border-bottom: 8px solid #000000;
    padding-bottom: 3px;
    margin-bottom: 3px;
  }

  .sf-serving-size {
    font-weight: 700;
    font-size: 10px;
  }

  .sf-servings-container {
    font-size: 10px;
  }

  /* Column Headers */
  .sf-column-header {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    border-bottom: 1px solid #000000;
    padding: 2px 0;
    font-size: 8px;
    font-weight: 700;
  }

  .sf-col-left {
    flex: 1;
  }

  .sf-col-amount {
    width: 90px;
    text-align: right;
    padding-right: 6px;
  }

  .sf-col-dv {
    width: 36px;
    text-align: right;
  }

  /* Ingredients */
  .sf-ingredients {
    border-bottom: 5px solid #000000;
  }

  .sf-row {
    display: flex;
    align-items: flex-start;
    padding: 3px 0;
    border-bottom: 1px solid #cccccc;
    font-size: 10px;
  }

  .sf-row:last-child {
    border-bottom: none;
  }

  .sf-ingredient-info {
    flex: 1;
    padding-right: 4px;
  }

  .sf-ingredient-name {
    font-weight: 700;
    display: block;
  }

  .sf-source {
    font-weight: 400;
    font-size: 9px;
    color: #333333;
    display: block;
    padding-left: 6px;
    line-height: 1.3;
  }

  .sf-ingredient-amount {
    width: 90px;
    text-align: right;
    padding-right: 6px;
    white-space: nowrap;
  }

  .sf-ingredient-dv {
    width: 36px;
    text-align: right;
    font-weight: 700;
  }

  /* Footer */
  .sf-footer {
    padding-top: 3px;
    font-size: 8px;
  }

  .sf-dv-note {
    margin: 0 0 4px 0;
  }

  .sf-other {
    margin: 4px 0;
    line-height: 1.3;
    word-wrap: break-word;
  }

  .sf-allergen {
    margin: 4px 0;
    line-height: 1.3;
  }

  .sf-other strong,
  .sf-allergen strong {
    font-weight: 700;
  }
</style>
```

---

### 6.3 Product Row - `src/components/catalog/ProductRow.astro`

```astro
---
/**
 * ProductRow Component
 * Displays product with generated Supplement Facts label
 */

import SupplementFactsLabel from './SupplementFactsLabel.astro';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  dailyValue?: string;
  source?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  servingSize: string;
  servingsPerContainer: number;
  ingredients: Ingredient[];
  otherIngredients?: string;
  allergenInfo?: string;
}

interface Props {
  product: Product;
}

const { product } = Astro.props;
---

<article class="product-row" data-category={product.category} data-product-id={product.id}>
  <!-- Supplement Facts Label (Generated from data) -->
  <div class="label-container">
    <SupplementFactsLabel
      servingSize={product.servingSize}
      servingsPerContainer={product.servingsPerContainer}
      ingredients={product.ingredients}
      otherIngredients={product.otherIngredients}
      allergenInfo={product.allergenInfo}
    />
  </div>

  <!-- Product Information -->
  <div class="product-info">
    <h3 class="product-name">{product.name}</h3>
    
    <div class="product-meta">
      <span class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        {product.servingSize}
      </span>

      <span class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        {product.servingsPerContainer} servings
      </span>

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
    grid-template-columns: 300px 1fr;
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

  .label-container {
    background: var(--color-bg-alt);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

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

  .product-description {
    font-size: 1rem;
    color: var(--color-text-muted);
    line-height: 1.7;
    margin: 0;
    margin-top: 0.5rem;
    max-width: 600px;
  }

  @media (max-width: 768px) {
    .product-row {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 1.25rem;
    }

    .label-container {
      justify-content: center;
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

  @media (min-width: 769px) and (max-width: 1024px) {
    .product-row {
      grid-template-columns: 280px 1fr;
      gap: 1.5rem;
    }

    .product-name {
      font-size: 1.5rem;
    }
  }
</style>
```

---

### 6.4 Category Section - `src/components/catalog/CategorySection.astro`

```astro
---
/**
 * CategorySection Component
 * Groups products under a category header
 */

import ProductRow from './ProductRow.astro';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  dailyValue?: string;
  source?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  servingSize: string;
  servingsPerContainer: number;
  ingredients: Ingredient[];
  otherIngredients?: string;
  allergenInfo?: string;
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

### 6.5 Filter Bar - `src/components/catalog/FilterBar.astro`

```astro
---
/**
 * FilterBar Component
 * Sticky filter bar with category tabs
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
      >
        All Products
      </button>
      {categories.map((category) => (
        <button 
          class="filter-tab" 
          data-category={category.key}
          role="tab"
          aria-selected="false"
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

        const selectedCategory = (tab as HTMLElement).dataset.category;
        let visibleCount = 0;

        if (selectedCategory === 'all') {
          categorySections.forEach(section => {
            (section as HTMLElement).style.display = 'block';
          });
          productRows.forEach(row => {
            (row as HTMLElement).style.display = 'grid';
            visibleCount++;
          });
        } else {
          categorySections.forEach(section => {
            const sectionCategory = (section as HTMLElement).dataset.category;
            (section as HTMLElement).style.display = 
              sectionCategory === selectedCategory ? 'block' : 'none';
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

        if (visibleCountEl) {
          visibleCountEl.textContent = visibleCount.toString();
        }

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

  document.addEventListener('DOMContentLoaded', initFilterBar);
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

### 6.6 Hero Section - `src/components/catalog/CatalogHero.astro`

```astro
---
/**
 * CatalogHero Component
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

### 6.7 Password Gate - `src/components/catalog/PasswordGate.astro`

```astro
---
/**
 * PasswordGate Component
 */

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

  if (checkAuth()) {
    showCatalog();
  }

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

## 7. Styling

### 7.1 CSS Variables

Add to your global stylesheet or Layout:

```css
/* Google Fonts - Add to <head> */
/*
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@400;600;700&display=swap" rel="stylesheet">
*/

:root {
  /* Colors */
  --color-bg: #FDFBF7;
  --color-bg-alt: #F5F1E8;
  --color-text: #1A1A1A;
  --color-text-muted: #5C5C5C;
  --color-accent: #2D5A4A;
  --color-accent-light: #3D7A64;
  --color-accent-pale: #E8F0ED;
  --color-border: #E0DCD3;
  --color-white: #FFFFFF;

  /* Typography */
  --font-display: 'Fraunces', serif;
  --font-body: 'DM Sans', sans-serif;
}

.hidden {
  display: none !important;
}
```

### 7.2 Font Import (HTML Head)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@400;600;700&display=swap" rel="stylesheet">
```

---

## 8. Implementation Steps

1. **Create file structure** as shown in Section 3
2. **Add CSS variables** to global stylesheet
3. **Add Google Fonts** to Layout head
4. **Create all components** from Section 6
5. **Create `products.json`** with your product data (see Section 5.2 for format)
6. **Set environment variable**: `CATALOG_PASSWORD=your_password`
7. **Test** the page at `/catalog`

---

## 9. Testing Checklist

### Functionality
- [ ] Password gate blocks access
- [ ] Correct password grants access
- [ ] Session persists on refresh
- [ ] All category filters work
- [ ] Product count updates correctly
- [ ] All Supplement Facts labels render correctly

### Responsive
- [ ] Desktop: Side-by-side layout
- [ ] Mobile: Stacked layout
- [ ] Filter tabs scroll horizontally on mobile

### Labels
- [ ] All ingredients display correctly
- [ ] Sources show indented below ingredient names
- [ ] Daily values align to the right
- [ ] "Other Ingredients" displays when present
- [ ] Footer note displays correctly

---

## 10. Adding New Products

To add a product, add an entry to the `products` array in `products.json`:

```json
{
  "id": "new-product-id",
  "name": "New Product Name",
  "category": "category-key",
  "categoryLabel": "Category Label",
  "description": "Product description here.",
  "servingSize": "2 Capsules",
  "servingsPerContainer": 30,
  "ingredients": [
    {
      "name": "Ingredient Name",
      "amount": "100",
      "unit": "mg",
      "dailyValue": "50%",
      "source": "(as Ingredient Form)"
    }
  ],
  "otherIngredients": "Capsule ingredients here."
}
```

The Supplement Facts label will be automatically generated from this data.

---

*End of Implementation Guide*