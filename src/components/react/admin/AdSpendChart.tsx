/**
 * AdSpendChart Component
 *
 * Bar chart showing daily ad spend with conversions overlay.
 * Follows the same pattern as OpportunitiesChart.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '../../ui/skeleton';
import type { AdsMetrics } from './hooks/useDashboardData';

interface AdSpendChartProps {
  data?: AdsMetrics['spendByDay'];
  isLoading?: boolean;
}

// Format currency for display
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Custom tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[140px]">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-600">
            {entry.dataKey === 'spend' ? 'Ad Spend' : 'Conversions'}
          </span>
          <span className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.dataKey === 'spend' ? formatCurrency(entry.value) : entry.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AdSpendChart({ data, isLoading }: AdSpendChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
        <div className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  // No data state
  if (!data?.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Ad Spend Trend</h2>
          <p className="text-sm text-gray-500 mt-1">Daily breakdown</p>
        </div>
        <div className="p-6 flex items-center justify-center h-[300px]">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-500 text-sm">No ad spend data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Ad Spend Trend</h2>
        <p className="text-sm text-gray-500 mt-1">Daily breakdown with conversions</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="dateLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              dx={-10}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dx={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="left"
              dataKey="spend"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="Ad Spend"
            />
            <Bar
              yAxisId="right"
              dataKey="conversions"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="Conversions"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdSpendChart;
