# Multi-Manufacturer Dashboard Implementation Plan

## Overview
Enable multiple manufacturers to have separate dashboard credentials, with data isolation and manufacturer-specific notes.

## Architecture (Simplified)

**Twenty CRM Fields:**
- `dashboard: ProductDashboardEnum` - Values: `DURLEVEL`, `AUSRESON` - determines which manufacturer sees the product
- `description: String` - Shared description (replaces old Notes column)
- `durlevelPublicNotes: String` - Notes visible only to Durlevel + admin
- `ausresonPublicNotes: String` - Notes visible only to Ausreson + admin

**Data Flow:**
```
admin_users.dashboard_access → matches → Product.dashboard enum value
```

- Twenty CRM handles both product assignment AND manufacturer-specific notes
- Supabase only needs to store which dashboard each user can access
- No separate notes table needed - CRM has manufacturer-specific note fields

---

## Phase 1: Database Migration

### 1.1 Add `dashboard_access` to `admin_users`
```sql
-- Add dashboard_access column to admin_users
-- Values match Twenty CRM ProductDashboardEnum: 'DURLEVEL', 'AUSRESON', or NULL for admins
ALTER TABLE admin_users
  ADD COLUMN dashboard_access TEXT;

-- Add comment for documentation
COMMENT ON COLUMN admin_users.dashboard_access IS
  'Which CRM dashboard the user can access. NULL for super_admin/staff (see all). Values: DURLEVEL, AUSRESON';

-- Update existing durlevel user
UPDATE admin_users
SET dashboard_access = 'DURLEVEL'
WHERE username_lower = 'durlevel';
```

**No additional tables needed** - Twenty CRM handles manufacturer-specific notes directly.

---

## Phase 2: Backend Changes

### 2.1 Update `src/utils/adminAuth.ts`
- Add `dashboard_access` to `AdminUser` interface
- Return `dashboard_access` in session verification

### 2.2 Update `src/utils/twentyCrmQuotes.ts`
- Remove hardcoded `MANUFACTURER_FILTER = 'Durlevel'` (line 18)
- Add `dashboardFilter?: string` to `FetchQuotesOptions` interface
- Update GraphQL query to fetch new fields: `dashboard`, `description`, `durlevelPublicNotes`, `ausresonPublicNotes`
- Filter products where `product.dashboard === dashboardFilter` (if provided)
- Admins/staff (no dashboardFilter) see all products

### 2.3 Update `src/pages/api/adminpanel/quotes.ts`
- Extract `dashboard_access` from auth result
- Pass as `dashboardFilter` to CRM fetch
- Return appropriate notes field based on user's dashboard_access

### 2.4 Update Quote Update API (`src/pages/api/adminpanel/quotes/[id].ts`)
- Allow updating `description` (shared)
- Allow updating manufacturer-specific notes (e.g., `durlevelPublicNotes` for Durlevel users)

---

## Phase 3: Frontend Changes

### 3.1 Update `QuoteTable.tsx`
- Rename "Notes" column to "Description"
- Display `description` field instead of `publicNotes`
- Add new "Notes" column for manufacturer-specific notes
  - For Durlevel users: show/edit `durlevelPublicNotes`
  - For Ausreson users: show/edit `ausresonPublicNotes`
  - For admins: show both (read-only or tabbed view)

### 3.2 Update `QuoteDetailPanel.tsx`
- Replace `publicNotes` with `description`
- Add manufacturer-specific notes section
- Show appropriate notes field based on user's dashboard_access

### 3.3 Update types (`src/components/react/admin/types.ts`)
```typescript
export interface Quote {
  // ... existing fields ...
  description?: string;           // Shared description (replaces publicNotes)
  durlevelPublicNotes?: string;   // Durlevel-only notes
  ausresonPublicNotes?: string;   // Ausreson-only notes
  dashboard?: string;             // Which dashboard this product belongs to
}
```

---

## Critical Files to Modify

| File | Changes |
|------|---------|
| `src/utils/adminAuth.ts` | Add `dashboard_access` to AdminUser interface |
| `src/utils/twentyCrmQuotes.ts` | Remove hardcoded filter, add dashboardFilter, fetch new fields |
| `src/pages/api/adminpanel/quotes.ts` | Pass dashboard filter based on user's dashboard_access |
| `src/pages/api/adminpanel/quotes/[id].ts` | Support updating description and manufacturer notes |
| `src/components/react/admin/QuoteTable.tsx` | Rename Notes→Description, add manufacturer notes column |
| `src/components/react/admin/QuoteDetailPanel.tsx` | Update fields for description and notes |

---

## Implementation Order

1. **Database migration** - Add `dashboard_access` to `admin_users`
2. **Update adminAuth.ts** - Include `dashboard_access` in session
3. **Update twentyCrmQuotes.ts** - Remove hardcoded filter, add new fields
4. **Update quotes API** - Pass dashboard filter
5. **Update quote update API** - Support new fields
6. **Update frontend** - New columns and fields

---

## Field Visibility Logic

| User | Products Visible | Description | Durlevel Notes | Ausreson Notes |
|------|------------------|-------------|----------------|----------------|
| Durlevel | `dashboard = DURLEVEL` | Read/Write | Read/Write | Hidden |
| Ausreson | `dashboard = AUSRESON` | Read/Write | Hidden | Read/Write |
| Staff | All | Read-only | Read-only | Read-only |
| Super Admin | All | Read/Write | Read/Write | Read/Write |

---

## Testing Checklist

- [ ] Durlevel user sees only products with `dashboard = DURLEVEL`
- [ ] Durlevel user can edit `description` and `durlevelPublicNotes`
- [ ] Durlevel user cannot see `ausresonPublicNotes`
- [ ] Admin/staff see all products
- [ ] Admin can see both manufacturer notes fields
- [ ] Backward compatible with existing data
