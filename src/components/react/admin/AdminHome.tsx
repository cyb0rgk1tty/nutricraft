/**
 * AdminHome Component
 * Main admin dashboard home page with charts, stats, and navigation
 */

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { OpportunitiesChart } from './OpportunitiesChart';
import { RecentActivity } from './RecentActivity';
import { QuickNav } from './QuickNav';
import { AdsStatsCards } from './AdsStatsCards';
import { AdSpendChart } from './AdSpendChart';
import { InvoiceStatsCards } from './InvoiceStatsCards';
import { RevenueChart } from './RevenueChart';
import { RecentPayments } from './RecentPayments';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useDashboardData, dashboardKeys } from './hooks/useDashboardData';
import { useInvoiceData } from './hooks/useInvoiceData';

interface AdminHomeProps {
  className?: string;
}

// Stats card component
function StatCard({
  label,
  value,
  icon,
  color = 'primary',
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'primary' | 'blue' | 'amber' | 'purple' | 'green';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function HomeContent({ className }: AdminHomeProps) {
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState(14);
  const [isSyncing, setIsSyncing] = useState(false);
  const { data, isLoading, error } = useDashboardData(selectedDays);
  const { data: invoiceData, isLoading: invoiceLoading } = useInvoiceData(30);

  // Listen for external refresh events
  useEffect(() => {
    const handleRefresh = () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    };

    window.addEventListener('refreshDashboard', handleRefresh);
    return () => window.removeEventListener('refreshDashboard', handleRefresh);
  }, [queryClient]);

  // Handle Google Ads sync
  const handleAdsSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/admin/google-ads/sync', {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Synced ${result.recordsSynced} records from Google Ads`);
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      } else {
        toast.error(result.error || 'Failed to sync Google Ads data');
      }
    } catch (err) {
      toast.error('Failed to sync Google Ads data');
      console.error('Ads sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle error state
  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Dashboard</h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: dashboardKeys.all })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalOpportunities = data?.totalOpportunities || 0;
  const dailyData = data?.opportunitiesByDay || [];

  // Calculate stats from daily data (using EST timezone)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const todayCount = dailyData.find(d => d.date === today)?.count || 0;

  // Last 7 days sum
  const last7Days = dailyData.slice(-7).reduce((sum, d) => sum + d.count, 0);

  // Last 14 days sum (all data)
  const last14Days = dailyData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={className}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Opportunities"
          value={isLoading ? '-' : totalOpportunities}
          color="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label="Today"
          value={isLoading ? '-' : todayCount}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Last 7 Days"
          value={isLoading ? '-' : last7Days}
          color="amber"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Last 14 Days"
          value={isLoading ? '-' : last14Days}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Opportunities Chart */}
      <div className="mb-6">
        <OpportunitiesChart
          data={dailyData}
          isLoading={isLoading}
          selectedDays={selectedDays}
          onDaysChange={setSelectedDays}
        />
      </div>

      {/* Google Ads Stats */}
      <div className="mb-6">
        <AdsStatsCards
          metrics={data?.adsMetrics}
          isLoading={isLoading}
          onRefresh={handleAdsSync}
          isSyncing={isSyncing}
        />
      </div>

      {/* Ad Spend Chart - only show if there's data */}
      {data?.adsMetrics?.spendByDay && data.adsMetrics.spendByDay.length > 0 && (
        <div className="mb-6">
          <AdSpendChart
            data={data.adsMetrics.spendByDay}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Invoice Stats */}
      <div className="mb-6">
        <InvoiceStatsCards
          stats={invoiceData?.stats}
          isLoading={invoiceLoading}
          configured={invoiceData?.configured}
        />
      </div>

      {/* Revenue Chart and Recent Payments - only show if Invoice Ninja is configured and has data */}
      {invoiceData?.configured && invoiceData?.stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RevenueChart
              data={invoiceData.stats.revenueByDay}
              isLoading={invoiceLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <RecentPayments
              payments={invoiceData.stats.recentPayments}
              isLoading={invoiceLoading}
            />
          </div>
        </div>
      )}

      {/* Quick Nav and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickNav
            totalOpportunities={totalOpportunities}
            announcementActive={data?.announcementActive}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity
            activities={data?.recentActivity || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export function AdminHome(props: AdminHomeProps) {
  return (
    <QueryProvider>
      <HomeContent {...props} />
    </QueryProvider>
  );
}

export default AdminHome;
