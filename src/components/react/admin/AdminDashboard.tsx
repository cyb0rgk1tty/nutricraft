/**
 * AdminDashboard Component
 * Main wrapper component that combines all React admin components
 * with providers and layout
 */

import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { QuoteTable } from './QuoteTable';
import { QuoteDetailPanel } from './QuoteDetailPanel';
import { StatusStrip } from './StatusStrip';
import { Toaster } from '@/components/ui/sonner';
import { quoteKeys } from './hooks/useQuotes';
import { useQuoteStore } from './stores/quoteStore';

interface AdminDashboardProps {
  className?: string;
  isAuthenticated?: boolean;
}

function DashboardContent({ className, isAuthenticated = false }: AdminDashboardProps) {
  const queryClient = useQueryClient();
  const setAuthenticated = useQuoteStore((state) => state.setAuthenticated);

  // Sync authentication state to store so queries can check it
  useEffect(() => {
    setAuthenticated(isAuthenticated);
  }, [isAuthenticated, setAuthenticated]);

  // Listen for external refresh events (from Astro header)
  useEffect(() => {
    const handleRefresh = () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    };

    window.addEventListener('refreshQuotes', handleRefresh);
    return () => window.removeEventListener('refreshQuotes', handleRefresh);
  }, [queryClient]);

  // Don't render anything until authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={className}>
      {/* Status Filter Strip */}
      <div className="mb-6">
        <StatusStrip />
      </div>

      {/* Main Table */}
      <QuoteTable />

      {/* Detail Panel (Sheet) */}
      <QuoteDetailPanel />

      {/* Toast Notifications */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export function AdminDashboard(props: AdminDashboardProps) {
  return (
    <QueryProvider>
      <DashboardContent {...props} />
    </QueryProvider>
  );
}

export default AdminDashboard;
