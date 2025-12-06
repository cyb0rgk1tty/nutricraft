# Dashboard Internationalization (i18n) Implementation Plan

## Overview
Add language selector to the manufacturer dashboard with support for English (default) and Chinese (Simplified).

**Scope**: Dashboard only (`/admin/quotes` and its components)

---

## Architecture Decision

### Recommended Approach: Lightweight Custom i18n Module

Since this is dashboard-only with just 2 languages, a lightweight custom solution is more appropriate than a full i18n library. The dashboard is client-side heavy with dynamic content rendering, so we need a solution that works seamlessly with JavaScript-rendered content.

**Key Design Principles:**
1. Single source of truth for translations
2. No page reload required when switching languages
3. Language preference persisted in localStorage
4. Works with both Astro templates and JavaScript-rendered content

---

## File Structure

```
src/
├── utils/
│   └── i18n/
│       ├── translations.ts    # All translation strings (EN + ZH)
│       └── index.ts           # Translation helper functions
├── components/
│   └── admin/
│       └── LanguageSelector.astro  # UI component for language toggle
```

---

## Implementation Steps

### Step 1: Create Translation Module

**File: `src/utils/i18n/translations.ts`**

```typescript
export const translations = {
  en: {
    // Page
    pageTitle: 'Manufacture Dashboard',
    pageDescription: 'Internal dashboard for managing manufacturer price quotes',

    // Auth
    enterPassword: 'Enter your password to continue',
    passwordPlaceholder: 'Enter admin password',
    accessDashboard: 'Access Dashboard',
    invalidPassword: 'Invalid password. Please try again.',

    // Header
    connected: 'Connected',
    refreshQuotes: 'Refresh quotes',
    logout: 'Logout',

    // Loading/Error States
    loadingQuotes: 'Loading quotes from Twenty CRM...',
    failedToLoad: 'Failed to Load Quotes',
    unableToConnect: 'Unable to connect to Twenty CRM',
    tryAgain: 'Try Again',
    noQuoteRequests: 'No Quote Requests',
    quotesWillAppear: 'Quote requests from Twenty CRM will appear here',

    // Table Headers
    created: 'Created',
    name: 'Name',
    stage: 'Stage',
    formula: 'Formula',
    price: 'Price',
    qty: 'Qty',
    searchQuotes: 'Search quotes...',
    quotes: 'quotes',
    noMatchingQuotes: 'No quotes match your search',

    // Status Labels
    all: 'All',
    priceQuote: 'Price Quote',
    orderSamples: 'Order Samples',
    sampleDelivered: 'Sample Delivered',
    fullBatchOrder: 'Full Batch Order',
    unknown: 'Unknown',

    // Table Content
    viewDetails: 'View details',
    unnamed: 'Unnamed',
    noFormulaUploaded: 'No formula uploaded',
    failedToLoadImage: 'Failed to load',

    // Relative Dates
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: '{n} days ago',
    weeksAgo: '{n} weeks ago',

    // Detail Panel
    quoteDetails: 'Quote details',
    productName: 'Product Name',
    closePanel: 'Close panel',
    productDetails: 'Product Details',
    updated: 'Updated',
    pricingQuantity: 'Pricing & Quantity',
    saving: 'Saving...',
    saved: 'Saved',
    orderQuantity: 'Order Quantity',
    internalNotes: 'Internal Notes',
    addNotesPlaceholder: 'Add internal notes about this quote...',
    formulaDocuments: 'Formula Documents',
    upload: 'Upload',
    uploading: 'Uploading...',
    noDocumentsUploaded: 'No documents uploaded',
    loadingDocuments: 'Loading documents...',
    syncToCRM: 'Sync to CRM',
    syncing: 'Syncing...',
    saveChanges: 'Save Changes',
    lastSyncedNever: 'Last synced: Never',
    lastSyncedJustNow: 'Last synced: Just now',
    lastSynced: 'Last synced: {time}',

    // Document Actions
    back: 'Back',
    view: 'View',
    delete: 'Delete',
    failedToDelete: 'Failed to delete document',
    failedToLoadDoc: 'Failed to load document',
    confirmDelete: 'Are you sure you want to delete "{filename}"?',
    reset: 'Reset',

    // Upload Messages
    fileSizeExceeds: 'File size exceeds 10MB limit',
    invalidFileType: 'Invalid file type. Only PDF, PNG, and JPEG are allowed.',
    uploadComplete: 'Upload complete!',
    uploadFailed: 'Upload failed',

    // Language
    language: 'Language',
    english: 'English',
    chinese: '中文',
  },

  zh: {
    // Page
    pageTitle: '制造商仪表板',
    pageDescription: '管理制造商报价请求的内部仪表板',

    // Auth
    enterPassword: '请输入密码继续',
    passwordPlaceholder: '输入管理员密码',
    accessDashboard: '访问仪表板',
    invalidPassword: '密码无效，请重试。',

    // Header
    connected: '已连接',
    refreshQuotes: '刷新报价',
    logout: '退出登录',

    // Loading/Error States
    loadingQuotes: '正在从 Twenty CRM 加载报价...',
    failedToLoad: '加载失败',
    unableToConnect: '无法连接到 Twenty CRM',
    tryAgain: '重试',
    noQuoteRequests: '暂无报价请求',
    quotesWillAppear: '来自 Twenty CRM 的报价请求将显示在这里',

    // Table Headers
    created: '创建时间',
    name: '名称',
    stage: '阶段',
    formula: '配方',
    price: '价格',
    qty: '数量',
    searchQuotes: '搜索报价...',
    quotes: '条报价',
    noMatchingQuotes: '没有匹配的报价',

    // Status Labels
    all: '全部',
    priceQuote: '报价中',
    orderSamples: '订购样品',
    sampleDelivered: '样品已交付',
    fullBatchOrder: '批量订单',
    unknown: '未知',

    // Table Content
    viewDetails: '查看详情',
    unnamed: '未命名',
    noFormulaUploaded: '未上传配方',
    failedToLoadImage: '加载失败',

    // Relative Dates
    today: '今天',
    yesterday: '昨天',
    daysAgo: '{n} 天前',
    weeksAgo: '{n} 周前',

    // Detail Panel
    quoteDetails: '报价详情',
    productName: '产品名称',
    closePanel: '关闭面板',
    productDetails: '产品详情',
    updated: '更新时间',
    pricingQuantity: '价格与数量',
    saving: '保存中...',
    saved: '已保存',
    orderQuantity: '订购数量',
    internalNotes: '内部备注',
    addNotesPlaceholder: '添加关于此报价的内部备注...',
    formulaDocuments: '配方文档',
    upload: '上传',
    uploading: '上传中...',
    noDocumentsUploaded: '暂无上传文档',
    loadingDocuments: '加载文档中...',
    syncToCRM: '同步到 CRM',
    syncing: '同步中...',
    saveChanges: '保存更改',
    lastSyncedNever: '最后同步：从未',
    lastSyncedJustNow: '最后同步：刚刚',
    lastSynced: '最后同步：{time}',

    // Document Actions
    back: '返回',
    view: '查看',
    delete: '删除',
    failedToDelete: '删除文档失败',
    failedToLoadDoc: '加载文档失败',
    confirmDelete: '确定要删除 "{filename}" 吗？',
    reset: '重置',

    // Upload Messages
    fileSizeExceeds: '文件大小超过 10MB 限制',
    invalidFileType: '无效的文件类型。仅允许 PDF、PNG 和 JPEG 格式。',
    uploadComplete: '上传完成！',
    uploadFailed: '上传失败',

    // Language
    language: '语言',
    english: 'English',
    chinese: '中文',
  }
};

export type Language = 'en' | 'zh';
export type TranslationKey = keyof typeof translations.en;
```

---

### Step 2: Create i18n Helper Module

**File: `src/utils/i18n/index.ts`**

```typescript
import { translations, type Language, type TranslationKey } from './translations';

const STORAGE_KEY = 'dashboard_language';
const DEFAULT_LANGUAGE: Language = 'en';

// Get current language from localStorage or default
export function getLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  return (localStorage.getItem(STORAGE_KEY) as Language) || DEFAULT_LANGUAGE;
}

// Set language and persist to localStorage
export function setLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Get translation by key with optional interpolation
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const lang = getLanguage();
  let text = translations[lang][key] || translations.en[key] || key;

  // Handle interpolation (e.g., "{n} days ago" -> "5 days ago")
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }

  return text;
}

// Get all translations for current language (for bulk operations)
export function getTranslations(): typeof translations.en {
  const lang = getLanguage();
  return translations[lang];
}

// Export for direct access if needed
export { translations, type Language, type TranslationKey };
```

---

### Step 3: Create Language Selector Component

**File: `src/components/admin/LanguageSelector.astro`**

A simple toggle button in the header that switches between EN and 中文.

**Location**: Add to the header section of `quotes.astro`, next to the Logout button.

**Design**:
- Two-button toggle style (similar to status filter buttons)
- Active button highlighted with primary color
- Compact design to fit in header

---

### Step 4: Update Dashboard Components

#### 4.1 `quotes.astro` (Main Page)
- Import i18n module in client script
- Add LanguageSelector component to header
- Replace hardcoded text with `data-i18n` attributes for static content
- Add `languageChanged` event listener to update all text

#### 4.2 `QuoteTable.astro`
- Update `stageLabels` mapping to use translation keys
- Update `formatRelativeDate()` to use translated strings
- Update table header rendering
- Update all JavaScript-generated strings

#### 4.3 `StatusStrip.astro`
- Update `stageLabels` mapping (shared with QuoteTable)
- Update "All" button text

#### 4.4 `QuoteDetailPanel.astro`
- Update all section headings
- Update button labels
- Update placeholders
- Update status button labels
- Update document section text
- Update relative time formatting

---

### Step 5: Shared Stage Labels

Create a centralized stage label configuration that both QuoteTable and StatusStrip can use:

```typescript
// In translations.ts, add stage key mapping
export const stageToTranslationKey: Record<string, TranslationKey> = {
  'planning': 'priceQuote',
  'order_samples': 'orderSamples',
  'client_review_samples': 'sampleDelivered',
  'full_batch_order': 'fullBatchOrder',
};
```

---

## Implementation Order

1. **Create i18n module** (`src/utils/i18n/translations.ts` and `index.ts`)
2. **Create LanguageSelector component** (`src/components/admin/LanguageSelector.astro`)
3. **Update quotes.astro** (add selector, wire up language change events)
4. **Update StatusStrip.astro** (simplest component, good for testing)
5. **Update QuoteTable.astro** (most text, dynamic content)
6. **Update QuoteDetailPanel.astro** (largest component, most text)

---

## UI/UX Considerations

1. **Language Toggle Position**: Top-right header, between sync status and logout button
2. **Toggle Style**: Two compact buttons "EN | 中文" with active state highlighting
3. **Persistence**: Language choice saved to localStorage, persists across sessions
4. **No Page Reload**: All text updates dynamically via JavaScript event
5. **Default**: English (matches current state)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/i18n/translations.ts` | **NEW** - All translation strings |
| `src/utils/i18n/index.ts` | **NEW** - Helper functions |
| `src/components/admin/LanguageSelector.astro` | **NEW** - Toggle component |
| `src/pages/admin/quotes.astro` | Add language selector, update static text |
| `src/components/admin/QuoteTable.astro` | Update all text rendering |
| `src/components/admin/StatusStrip.astro` | Update status labels |
| `src/components/admin/QuoteDetailPanel.astro` | Update all text rendering |

---

## Text Count Summary

| Category | Count |
|----------|-------|
| Page/Auth | 10 strings |
| Header/Navigation | 4 strings |
| Loading/Error States | 7 strings |
| Table Headers & UI | 8 strings |
| Status Labels | 6 strings |
| Table Content | 4 strings |
| Relative Dates | 4 patterns |
| Detail Panel | 25+ strings |
| Document Actions | 10 strings |
| Upload Messages | 4 strings |
| **Total** | ~80 strings |

---

## Testing Checklist

- [ ] Language toggle switches all visible text
- [ ] Language persists after page refresh
- [ ] Status labels update in table and status strip
- [ ] Relative dates display correctly in both languages
- [ ] Detail panel text updates when language changes
- [ ] Document section text updates
- [ ] Error messages display in correct language
- [ ] Placeholders update in inputs
- [ ] No text falls back to keys (all translations present)
