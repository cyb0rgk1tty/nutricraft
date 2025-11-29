# Product Requirements Document (PRD)

## Password-Protected Product Catalog Page

**Project:** Nutricraft Labs Website  
**Framework:** Astro  
**Version:** 1.0  
**Last Updated:** November 2025

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
Styling: CSS (scoped to component) or Tailwind if already in use
Data: JSON file for product data
Images: Static assets in /public or /src/assets
Authentication: Simple client-side password gate (not session-based)
```

### 2.2 File Structure

```
src/
├── pages/
│   └── catalog.astro              # Main catalog page with password gate
├── components/
│   └── catalog/
│       ├── PasswordGate.astro     # Password protection component
│       ├── CatalogHero.astro      # Hero section
│       ├── FilterBar.astro        # Category filter tabs
│       ├── ProductRow.astro       # Individual product display
│       └── CategorySection.astro  # Category grouping wrapper
├── data/
│   └── products.json              # Product data file
├── assets/
│   └── labels/                    # Supplement Facts images
│       ├── calm-support.png
│       ├── deep-sleep-formula.png
│       └── ... (all product label images)
```

---

## 3. Password Protection

### 3.1 Implementation Approach

Use a client-side password gate that:
1. Shows a password input form on initial page load
2. Validates against a hardcoded password (stored in environment variable)
3. On successful authentication, stores a flag in `sessionStorage`
4. Subsequent visits in the same session bypass the password prompt
5. Displays the catalog content only after authentication

### 3.2 Password Gate Component

```astro
// src/components/catalog/PasswordGate.astro

---
const CATALOG_PASSWORD = import.meta.env.CATALOG_PASSWORD || 'nutricraft2025';
---

<div id="password-gate" class="password-gate">
  <div class="password-modal">
    <h2>Product Catalog Access</h2>
    <p>Please enter the password to view the catalog.</p>
    <form id="password-form">
      <input 
        type="password" 
        id="password-input" 
        placeholder="Enter password"
        autocomplete="off"
      />
      <button type="submit">Access Catalog</button>
      <p id="password-error" class="error hidden">Incorrect password. Please try again.</p>
    </form>
  </div>
</div>

<div id="catalog-content" class="hidden">
  <slot />
</div>

<script define:vars={{ password: CATALOG_PASSWORD }}>
  const CORRECT_PASSWORD = password;
  const STORAGE_KEY = 'catalog_authenticated';

  function checkAuth() {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  }

  function showCatalog() {
    document.getElementById('password-gate').classList.add('hidden');
    document.getElementById('catalog-content').classList.remove('hidden');
  }

  function showError() {
    document.getElementById('password-error').classList.remove('hidden');
  }

  // Check if already authenticated
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
</script>
```

### 3.3 Environment Variable

Add to `.env` file:

```
CATALOG_PASSWORD=your_secure_password_here
```

---

## 4. Data Structure

### 4.1 Product Schema

Each product in `products.json` must follow this structure:

```typescript
interface Product {
  id: string;                    // Unique identifier (kebab-case)
  name: string;                  // Display name
  category: string;              // Category key (kebab-case)
  categoryLabel: string;         // Category display name
  description: string;           // Product description (1-3 sentences)
  servingSize: string;           // e.g., "2 Capsules", "1 Scoop (8g)"
  servingsPerContainer: number;  // e.g., 30, 45, 60
  labelImage: string;            // Path to Supplement Facts image
}
```

### 4.2 Sample products.json

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
    }
  ]
}
```

### 4.3 Category Keys

Use consistent category keys across all products:

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

## 5. Page Layout

### 5.1 Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (existing site header)                               │
├─────────────────────────────────────────────────────────────┤
│ HERO SECTION                                                │
│   - Title: "Product Catalog"                                │
│   - Subtitle: Brief description                             │
├─────────────────────────────────────────────────────────────┤
│ FILTER BAR (sticky)                                         │
│   [All] [Sleep] [Energy] [Immunity] [Cognitive] [...]       │
│   "Showing X products"                                      │
├─────────────────────────────────────────────────────────────┤
│ CATEGORY SECTION: Sleep & Relaxation (2 products)          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ┌──────────┐  Product Name                              │ │
│ │ │          │  ○ Serving Size  ○ Servings per container  │ │
│ │ │  LABEL   │                                            │ │
│ │ │  IMAGE   │  Description text goes here describing     │ │
│ │ │          │  the product benefits and key ingredients. │ │
│ │ └──────────┘                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ (Next product in category...)                           │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ CATEGORY SECTION: Energy & Performance (3 products)        │
│   ...                                                       │
├─────────────────────────────────────────────────────────────┤
│ FOOTER (existing site footer)                               │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Product Row Layout

Desktop (≥768px):
```
┌────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐   PRODUCT NAME                                │
│  │             │   ◦ 2 Capsules  ◦ 45 servings                 │
│  │   LABEL     │                                               │
│  │   IMAGE     │   Product description text that explains      │
│  │  (280px)    │   the benefits, key ingredients, and ideal   │
│  │             │   use case for this supplement formula.       │
│  └─────────────┘                                               │
└────────────────────────────────────────────────────────────────┘
```

Mobile (<768px):
```
┌──────────────────────────┐
│  ┌────────────────────┐  │
│  │                    │  │
│  │    LABEL IMAGE     │  │
│  │     (centered)     │  │
│  │                    │  │
│  └────────────────────┘  │
│                          │
│  PRODUCT NAME            │
│  ◦ 2 Capsules            │
│  ◦ 45 servings           │
│                          │
│  Product description...  │
└──────────────────────────┘
```

---

## 6. Component Specifications

### 6.1 Main Page (catalog.astro)

```astro
---
import Layout from '../layouts/Layout.astro';
import PasswordGate from '../components/catalog/PasswordGate.astro';
import CatalogHero from '../components/catalog/CatalogHero.astro';
import FilterBar from '../components/catalog/FilterBar.astro';
import CategorySection from '../components/catalog/CategorySection.astro';
import productsData from '../data/products.json';

const { categories, products } = productsData;
---

<Layout title="Product Catalog | Nutricraft Labs">
  <PasswordGate>
    <CatalogHero />
    <main class="catalog-main">
      <FilterBar categories={categories} totalProducts={products.length} />
      <div id="catalog-products">
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category.key);
          return categoryProducts.length > 0 && (
            <CategorySection 
              category={category} 
              products={categoryProducts} 
            />
          );
        })}
      </div>
    </main>
  </PasswordGate>
</Layout>
```

### 6.2 FilterBar Component

Props:
- `categories`: Array of category objects
- `totalProducts`: Total product count

Functionality:
- Display "All Products" tab plus one tab per category
- Clicking a tab filters visible products
- Update product count display
- Sticky positioning below header

### 6.3 ProductRow Component

Props:
- `product`: Product object

Display:
- Label image (left side, 280px width on desktop)
- Product name (h3)
- Serving size and servings per container (with icons)
- Description paragraph

### 6.4 CategorySection Component

Props:
- `category`: Category object with key and label
- `products`: Array of products in this category

Display:
- Category header with name and product count badge
- List of ProductRow components

---

## 7. Styling Specifications

### 7.1 Color Palette

```css
:root {
  --color-bg: #FDFBF7;           /* Page background */
  --color-bg-alt: #F5F1E8;       /* Card/section background */
  --color-text: #1A1A1A;         /* Primary text */
  --color-text-muted: #5C5C5C;   /* Secondary text */
  --color-accent: #2D5A4A;       /* Primary accent (forest green) */
  --color-accent-light: #3D7A64; /* Lighter accent */
  --color-accent-pale: #E8F0ED;  /* Very light accent (badges) */
  --color-border: #E0DCD3;       /* Borders */
  --color-white: #FFFFFF;        /* White */
}
```

### 7.2 Typography

```css
/* Fonts - Import from Google Fonts */
--font-display: 'Fraunces', serif;    /* Headings */
--font-body: 'DM Sans', sans-serif;   /* Body text */

/* Sizes */
Hero title: 3rem (48px)
Category header: 1.5rem (24px)
Product name: 1.75rem (28px)
Body text: 1rem (16px)
Meta text: 0.85rem (13.6px)
```

### 7.3 Spacing & Layout

```css
/* Container */
max-width: 1200px;
padding: 2rem;

/* Product row */
gap: 2rem (between image and content)
padding: 1.5rem
border-radius: 12px

/* Label image container */
width: 280px (desktop)
max-width: 300px (mobile, centered)

/* Category sections */
margin-bottom: 3rem
```

### 7.4 Filter Bar

```css
/* Sticky positioning */
position: sticky;
top: [header-height]; /* Adjust based on existing header */
background: var(--color-bg);
z-index: 90;
padding: 1.5rem 0;
border-bottom: 1px solid var(--color-border);

/* Filter tabs */
padding: 0.6rem 1.25rem;
border-radius: 50px;
font-size: 0.875rem;
font-weight: 500;

/* Active state */
background: var(--color-accent);
color: white;
```

---

## 8. Filtering Logic

### 8.1 Client-Side Implementation

```javascript
// Filter functionality
const filterTabs = document.querySelectorAll('.filter-tab');
const categorySections = document.querySelectorAll('.category-section');
const productRows = document.querySelectorAll('.product-row');
const productCount = document.getElementById('product-count');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const selectedCategory = tab.dataset.category;
    let visibleCount = 0;

    if (selectedCategory === 'all') {
      // Show all sections and products
      categorySections.forEach(section => section.style.display = 'block');
      productRows.forEach(row => {
        row.style.display = 'grid';
        visibleCount++;
      });
    } else {
      // Hide all sections first
      categorySections.forEach(section => {
        if (section.dataset.category === selectedCategory) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });

      // Show only matching products
      productRows.forEach(row => {
        if (row.dataset.category === selectedCategory) {
          row.style.display = 'grid';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });
    }

    // Update count
    productCount.textContent = visibleCount;
  });
});
```

---

## 9. Image Handling

### 9.1 Label Image Requirements

- **Format:** PNG (preferred) or JPG
- **Dimensions:** Minimum 400px width, aspect ratio ~3:4 (portrait)
- **File naming:** Use product `id` as filename (e.g., `calm-support.png`)
- **Location:** `/public/labels/` or `/src/assets/labels/`

### 9.2 Image Optimization

If using Astro's built-in image optimization:

```astro
---
import { Image } from 'astro:assets';
import labelImage from `../assets/labels/${product.id}.png`;
---

<Image 
  src={labelImage} 
  alt={`${product.name} Supplement Facts`}
  width={280}
  loading="lazy"
/>
```

If using static public folder:

```astro
<img 
  src={product.labelImage} 
  alt={`${product.name} Supplement Facts`}
  width="280"
  loading="lazy"
/>
```

### 9.3 Fallback for Missing Images

```astro
<div class="label-container">
  {product.labelImage ? (
    <img src={product.labelImage} alt={`${product.name} Supplement Facts`} />
  ) : (
    <div class="label-placeholder">
      <span>Label image coming soon</span>
    </div>
  )}
</div>
```

---

## 10. Accessibility Requirements

### 10.1 Semantic HTML

- Use `<main>` for primary content
- Use `<section>` for category groups
- Use `<article>` for individual products
- Use appropriate heading hierarchy (h1 → h2 → h3)

### 10.2 Image Alt Text

All label images must have descriptive alt text:
```
alt="{Product Name} Supplement Facts"
```

### 10.3 Keyboard Navigation

- Filter tabs must be focusable and operable with Enter/Space
- Password form must be fully keyboard accessible
- Focus states must be visible

### 10.4 Color Contrast

Ensure all text meets WCAG AA standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3:1 contrast ratio minimum

---

## 11. Performance Considerations

### 11.1 Image Loading

- Use `loading="lazy"` on all product images
- Consider using Astro's `<Image>` component for automatic optimization
- Implement placeholder/skeleton while images load

### 11.2 Initial Load

- Render all products server-side (Astro default)
- Filter functionality is client-side only (no page reload)
- Minimize JavaScript payload

### 11.3 With 100 Products

- Consider virtual scrolling if performance issues arise
- Implement image lazy loading (critical)
- Test on slower connections

---

## 12. Testing Checklist

### 12.1 Functionality

- [ ] Password gate blocks access without correct password
- [ ] Correct password grants access and persists for session
- [ ] "All Products" filter shows all products grouped by category
- [ ] Individual category filters show only matching products
- [ ] Product count updates correctly when filtering
- [ ] All label images load correctly
- [ ] Page is scrollable and all content is accessible

### 12.2 Responsive Design

- [ ] Desktop layout (≥1024px): Side-by-side layout works correctly
- [ ] Tablet layout (768-1023px): Layout adapts appropriately
- [ ] Mobile layout (<768px): Stacked layout, scrollable filter tabs
- [ ] Filter bar remains sticky on scroll (all breakpoints)

### 12.3 Cross-Browser

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 12.4 Accessibility

- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA
- [ ] Focus states are visible

---

## 13. Deployment Notes

### 13.1 Environment Variables

Ensure `CATALOG_PASSWORD` is set in production environment:

```bash
# .env.production
CATALOG_PASSWORD=secure_production_password
```

### 13.2 Build Command

Standard Astro build:
```bash
npm run build
```

### 13.3 No Additional Server Requirements

This implementation uses:
- Static site generation (SSG)
- Client-side password validation
- Session storage for auth state

No server-side authentication or database required.

---

## 14. Future Enhancements (Out of Scope for V1)

- Server-side authentication with user accounts
- Search functionality within catalog
- Product comparison feature
- PDF export of catalog
- Admin interface for product management
- Integration with inventory/ordering system

---

## 15. Reference Files

### 15.1 Design Reference

The HTML prototype file `supplement-catalog-scroll.html` contains:
- Complete styling (CSS)
- Layout structure
- Filter functionality (JavaScript)
- Mock product data

Use this as the definitive design reference.

### 15.2 Assets to Be Provided

The following will be provided separately:
- Supplement Facts label images (PNG format)
- Complete `products.json` with all ~100 products
- Any brand-specific assets (logo, fonts if different)

---

## 16. Implementation Steps Summary

1. **Create file structure** - Set up components and data directories
2. **Add products.json** - Create data file with provided product information
3. **Add label images** - Place all Supplement Facts images in assets folder
4. **Build PasswordGate component** - Implement password protection
5. **Build FilterBar component** - Implement category filtering
6. **Build ProductRow component** - Display individual products
7. **Build CategorySection component** - Group products by category
8. **Build main catalog page** - Assemble all components
9. **Add styling** - Apply CSS from design reference
10. **Add filtering logic** - Implement client-side JavaScript
11. **Set environment variable** - Configure catalog password
12. **Test thoroughly** - Run through testing checklist
13. **Deploy** - Build and deploy to production

---

*End of PRD*