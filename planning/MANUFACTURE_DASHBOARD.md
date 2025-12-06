# Manufacturer Dashboard - Implementation Plan

## Overview

Build a **flexible manufacturer dashboard** for tracking and pricing quote requests from Twenty CRM. The dashboard will:
- **Pull** quote requests from a Twenty CRM custom object
- Display them in a scannable table with detail panel
- Allow inline price updates per product
- **Auto-sync** changes back to Twenty CRM

---

## UI/UX Decision: Hybrid Table + Detail Panel

### Why This Approach

| Pattern | Pros | Cons | Verdict |
|---------|------|------|---------|
| **Kanban** | Visual workflow | Low data density, drag-drop complexity | Not ideal for pricing |
| **Spreadsheet** | Familiar, dense, bulk ops | Overwhelming, less detail | Good but needs enhancement |
| **Card Grid** | Modern, visual | Very low density | Not suitable |
| **Hybrid Table + Panel** | Dense overview + rich detail | Slightly more complex | **Best fit** |

**Selected: Hybrid Table + Detail Panel** because:
1. Manufacturers are familiar with spreadsheet-style workflows
2. Pricing requires high data density (multiple products, prices, notes)
3. Detail panel allows rich editing without losing context
4. Works well with vanilla JS (no React/Vue needed)
5. Reuses existing patterns (FilterDrawer slide-out)

### Kanban Summary Strip (Secondary)

Add a status summary strip at top for quick filtering:
```
[New: 12] → [In Progress: 5] → [Quote Sent: 8] → [Won: 3] → [Lost: 1]
```
Clicking a status filters the table. Simple to implement, no drag-drop required.

---

## Architecture

### Data Flow

```
Twenty CRM (Custom Object)
         ↓ fetch
   Dashboard Table
         ↓ edit
   Detail Panel (price per product, notes)
         ↓ auto-sync
Twenty CRM (update record)
```

### Key Design Decisions

1. **Flexible Schema**: Dashboard fetches whatever fields exist on the CRM object
2. **Single User Auth**: Password gate (like catalog), stored in `.env`
3. **Price Per Product**: Support multiple products per quote with individual pricing
4. **Auto-Sync**: Changes push to CRM automatically (debounced)

---

## File Structure

```
src/
├── pages/
│   └── admin/
│       └── quotes.astro          # Main dashboard page (password protected)
├── components/
│   └── admin/
│       ├── QuoteTable.astro      # Main table component
│       ├── QuoteDetailPanel.astro # Slide-out detail panel
│       ├── StatusBadge.astro     # Color-coded status badge
│       ├── StatusStrip.astro     # Kanban summary strip
│       └── InlinePrice.astro     # Inline price editing component
├── utils/
│   └── twentyCrmQuotes.ts        # CRM fetch/update functions for quotes
└── pages/api/admin/
    ├── quotes.ts                 # GET: fetch quotes from CRM
    └── quotes/[id].ts            # PATCH: update quote in CRM
```

---

## Implementation Phases

### Phase 1: Core Infrastructure

**1.1 Create Admin Route with Password Protection**
- File: `src/pages/admin/quotes.astro`
- Reuse `PasswordGate.astro` pattern
- Add `ADMIN_PASSWORD` to `.env`

**1.2 Twenty CRM Quote Utilities**
- File: `src/utils/twentyCrmQuotes.ts`
- Functions:
  - `fetchQuotesFromCRM()` - GraphQL query to fetch custom object records
  - `updateQuoteInCRM(id, data)` - GraphQL mutation to update record
  - `fetchCRMObjectSchema()` - Introspection query to get available fields (for flexibility)

**1.3 API Endpoints**
- `GET /api/admin/quotes` - Proxy to CRM fetch (handles auth)
- `PATCH /api/admin/quotes/[id]` - Proxy to CRM update

### Phase 2: Table View

**2.1 QuoteTable Component**
- Sortable columns (click header)
- Row selection (checkbox)
- Status filtering via Kanban strip
- Responsive: collapses to cards on mobile

**2.2 Default Columns** (flexible - will display whatever CRM returns)
| Column | Type | Notes |
|--------|------|-------|
| Customer | Text | Primary identifier |
| Status | Badge | Color-coded dropdown |
| Products | Pills | Expandable list |
| Total Price | Currency | Sum of product prices |
| Created | Date | Relative format |
| Actions | Icons | View details |

**2.3 StatusStrip Component**
- Count quotes by status
- Click to filter table
- Visual pipeline indicator

### Phase 3: Detail Panel

**3.1 QuoteDetailPanel Component**
- Slide-out from right (like FilterDrawer)
- Sections:
  - Header: Customer info + status
  - Products: List with individual price inputs
  - Notes: Textarea for internal notes
  - Activity: Change history (if available from CRM)
  - Actions: Save, sync status

**3.2 Price Per Product UI**
```
┌─────────────────────────────────────┐
│ Products                            │
├─────────────────────────────────────┤
│ Calm Focus Blend (Capsules)         │
│ Qty: 5,000  │ Price: [$_____]       │
├─────────────────────────────────────┤
│ Sleep Support Formula (Gummies)     │
│ Qty: 2,500  │ Price: [$_____]       │
├─────────────────────────────────────┤
│ Total Quote Price: $XX,XXX          │
└─────────────────────────────────────┘
```

**3.3 Auto-Save Behavior**
- Debounce price/note changes (500ms)
- Show "Saving..." indicator
- Show "Synced" confirmation
- Handle errors with retry option

### Phase 4: CRM Integration

**4.1 Fetch Quotes**
```typescript
// GraphQL query - flexible to handle any custom object
const query = `
  query FetchQuotes($filter: YourCustomObjectFilterInput) {
    yourCustomObjects(filter: $filter, first: 100) {
      edges {
        node {
          id
          ... // all available fields
        }
      }
    }
  }
`;
```

**4.2 Update Quote**
```typescript
// GraphQL mutation
const mutation = `
  mutation UpdateQuote($id: ID!, $data: YourCustomObjectUpdateInput!) {
    updateYourCustomObject(id: $id, data: $data) {
      id
      ... // updated fields
    }
  }
`;
```

**4.3 Schema Introspection** (for flexibility)
```typescript
// Query CRM to discover available fields
const introspectionQuery = `
  query {
    __type(name: "YourCustomObject") {
      fields {
        name
        type { name }
      }
    }
  }
`;
```

---

## Critical Files to Reference

| File | Purpose |
|------|---------|
| `src/utils/twentyCrm.ts` | Existing CRM patterns (GraphQL, auth, error handling) |
| `src/components/catalog/FilterDrawer.astro` | Slide-out panel pattern |
| `src/components/catalog/PasswordGate.astro` | Auth gate pattern |
| `src/pages/api/contact.ts` | API endpoint patterns |
| `tailwind.config.mjs` | Design system (colors, spacing) |

---

## UI Components Detail

### StatusBadge.astro
```astro
<!-- Color mapping -->
new       → bg-blue-100 text-blue-700
in_progress → bg-yellow-100 text-yellow-700
sent      → bg-purple-100 text-purple-700
won       → bg-green-100 text-green-700
lost      → bg-red-100 text-red-700
```

### InlinePrice.astro
- Click to edit
- Currency formatting ($X,XXX.XX)
- Tab/Enter to save
- Escape to cancel
- Visual feedback on save

### Table Row Interactions
- **Click row**: Opens detail panel
- **Click status badge**: Inline dropdown to change status
- **Click checkbox**: Select for bulk ops (future)

---

## Mobile Responsiveness

### Desktop (1024px+)
- Full table with all columns
- Detail panel as 400px slide-out

### Tablet (768-1023px)
- Table with fewer columns
- Detail panel at 50% width

### Mobile (<768px)
- Table becomes stacked cards
- Detail panel becomes full screen
- Swipe to dismiss

---

## Environment Variables

Add to `.env`:
```env
# Admin dashboard password
ADMIN_PASSWORD=your-secure-password

# Twenty CRM (existing)
TWENTY_API_URL=https://your-workspace.twenty.com/graphql
TWENTY_API_KEY=eyJ...

# Custom object name (configure when known)
TWENTY_QUOTE_OBJECT_NAME=YourCustomObject
```

---

## Implementation Order

1. **Phase 1.1**: Create `/admin/quotes.astro` with password gate
2. **Phase 1.2**: Create `twentyCrmQuotes.ts` with fetch function
3. **Phase 1.3**: Create API endpoint `GET /api/admin/quotes`
4. **Phase 2.1**: Build `QuoteTable.astro` with mock data
5. **Phase 2.3**: Add `StatusStrip.astro` for filtering
6. **Phase 3.1**: Build `QuoteDetailPanel.astro`
7. **Phase 3.2**: Add price inputs per product
8. **Phase 3.3**: Implement auto-save with debounce
9. **Phase 4.2**: Create update API endpoint
10. **Phase 4**: Wire up live CRM data

---

## Future Enhancements (Not in MVP)

- [ ] Bulk status changes
- [ ] Export to CSV
- [ ] Quote PDF generation
- [ ] Email quote to customer
- [ ] Activity log / audit trail
- [ ] Keyboard shortcuts
- [ ] Search and advanced filters
- [ ] Multiple user accounts

---

## Flexibility Notes

Since the Twenty CRM custom object fields are TBD:

1. **Generic Field Mapping**: The dashboard will query all available fields and display them
2. **Configuration File**: Create a mapping config that can be updated:
   ```typescript
   // src/config/quoteFields.ts
   export const quoteFieldMapping = {
     customerName: 'name', // CRM field name
     status: 'stage',
     products: 'lineItems',
     price: 'amount',
     notes: 'notes',
   };
   ```
3. **Graceful Handling**: Display "Unknown field" for unmapped data rather than breaking

When you provide the custom object name and fields, I'll update the field mapping accordingly.
