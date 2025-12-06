/**
 * Dashboard Internationalization - Translation Strings
 * Supports English (default) and Chinese (Simplified)
 */

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
    togglePasswordVisibility: 'Toggle password visibility',

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
    id: 'ID',
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

    // Relative time for sync
    minutesAgo: '{n}m ago',
    hoursAgo: '{n}h ago',
    daysAgoShort: '{n}d ago',
    justNow: 'Just now',

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
    error: 'Error: {message}',

    // Language
    language: 'Language',
    english: 'EN',
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
    togglePasswordVisibility: '切换密码可见性',

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
    id: 'ID',
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

    // Relative time for sync
    minutesAgo: '{n}分钟前',
    hoursAgo: '{n}小时前',
    daysAgoShort: '{n}天前',
    justNow: '刚刚',

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
    error: '错误：{message}',

    // Language
    language: '语言',
    english: 'EN',
    chinese: '中文',
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

/**
 * Map CRM stage keys to translation keys
 */
export const stageToTranslationKey: Record<string, TranslationKey> = {
  'planning': 'priceQuote',
  'order_samples': 'orderSamples',
  'client_review_samples': 'sampleDelivered',
  'full_batch_order': 'fullBatchOrder',
};

/**
 * Stage order for consistent display
 */
export const stageOrder = ['planning', 'order_samples', 'client_review_samples', 'full_batch_order'];
