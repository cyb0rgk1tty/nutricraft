/**
 * AdminHome Component
 * Main admin dashboard home page with charts, stats, and navigation
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { OpportunitiesChart } from './OpportunitiesChart';
import { RecentActivity } from './RecentActivity';
import { QuickNav } from './QuickNav';
import { Toaster } from '@/components/ui/sonner';
import { useDashboardData, dashboardKeys } from './hooks/useDashboardData';

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
  const { data, isLoading, error } = useDashboardData();

  // Listen for external refresh events
  useEffect(() => {
    const handleRefresh = () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    };

    window.addEventListener('refreshDashboard', handleRefresh);
    return () => window.removeEventListener('refreshDashboard', handleRefresh);
  }, [queryClient]);

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

  const statusCounts = data?.statusCounts || {};
  const totalQuotes = data?.totalQuotes || 0;

  return (
    <div className={className}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Quotes"
          value={isLoading ? '-' : totalQuotes}
          color="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Price Quote"
          value={isLoading ? '-' : (statusCounts.planning || 0)}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="In Progress"
          value={isLoading ? '-' : ((statusCounts.order_samples || 0) + (statusCounts.client_review_samples || 0))}
          color="amber"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Full Batch"
          value={isLoading ? '-' : (statusCounts.full_batch_order || 0)}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Opportunities Chart */}
      <div className="mb-6">
        <OpportunitiesChart
          data={data?.opportunitiesByWeek || []}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Nav and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickNav
            statusCounts={statusCounts}
            totalQuotes={totalQuotes}
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
