/**
 * OpportunitiesChart Component
 * Displays a stacked bar chart of opportunities by week
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { WeeklyData } from './hooks/useDashboardData';
import { Skeleton } from '../../ui/skeleton';

interface OpportunitiesChartProps {
  data: WeeklyData[];
  isLoading?: boolean;
}

// Stage colors matching the brand
const stageConfig = {
  planning: {
    label: 'Price Quote',
    color: '#60a5fa', // blue-400
  },
  order_samples: {
    label: 'Order Samples',
    color: '#f59e0b', // amber-500
  },
  client_review_samples: {
    label: 'Sample Delivered',
    color: '#8b5cf6', // purple-500
  },
  full_batch_order: {
    label: 'Full Batch',
    color: '#10b981', // green-500 (matches primary)
  },
};

// Get all unique stages from data
function getUniqueStages(data: WeeklyData[]): string[] {
  const stages = new Set<string>();
  data.forEach((week) => {
    Object.keys(week.stages).forEach((stage) => stages.add(stage));
  });
  // Sort by the order in stageConfig
  const stageOrder = Object.keys(stageConfig);
  return Array.from(stages).sort(
    (a, b) => stageOrder.indexOf(a) - stageOrder.indexOf(b)
  );
}

// Transform data to flatten stages for Recharts
function transformData(data: WeeklyData[]): Array<Record<string, string | number>> {
  return data.map((week) => ({
    week: week.week,
    weekLabel: week.weekLabel,
    total: week.count,
    ...week.stages,
  }));
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[160px]">
      <p className="font-semibold text-gray-900 mb-2">Week of {label}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const config = stageConfig[entry.name as keyof typeof stageConfig];
          return (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">
                  {config?.label || entry.name}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">{entry.value}</span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-100 mt-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <span className="text-sm font-bold text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  );
}

// Custom legend
function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry) => {
        const config = stageConfig[entry.value as keyof typeof stageConfig];
        return (
          <div key={entry.value} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">
              {config?.label || entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function OpportunitiesChart({ data, isLoading }: OpportunitiesChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <div className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  const chartData = transformData(data);
  const stages = getUniqueStages(data);

  // If no data, show empty state
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Opportunities Over Time</h2>
          <p className="text-sm text-gray-500 mt-1">Weekly breakdown by stage</p>
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
            <p className="text-gray-500 text-sm">No opportunity data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Opportunities Over Time</h2>
        <p className="text-sm text-gray-500 mt-1">Weekly breakdown by stage (last 12 weeks)</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="weekLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              allowDecimals={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {stages.map((stage) => {
              const config = stageConfig[stage as keyof typeof stageConfig];
              return (
                <Bar
                  key={stage}
                  dataKey={stage}
                  name={stage}
                  stackId="a"
                  fill={config?.color || '#94a3b8'}
                  radius={stage === stages[stages.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
