/**
 * OpportunitiesChart Component
 * Displays a simple bar chart of new opportunities per day
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
import type { DailyData } from './hooks/useDashboardData';
import { Skeleton } from '../../ui/skeleton';

interface OpportunitiesChartProps {
  data: DailyData[];
  isLoading?: boolean;
  selectedDays: number;
  onDaysChange: (days: number) => void;
}

// Date range options for the dropdown
const DATE_RANGE_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
];

// Custom tooltip
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[120px]">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-600">New Opportunities</span>
        <span className="text-sm font-bold text-primary">{payload[0].value}</span>
      </div>
    </div>
  );
}

export function OpportunitiesChart({ data, isLoading, selectedDays, onDaysChange }: OpportunitiesChartProps) {
  // Dropdown component for reuse across states
  const DateRangeDropdown = (
    <select
      value={selectedDays}
      onChange={(e) => onDaysChange(Number(e.target.value))}
      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:border-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
    >
      {DATE_RANGE_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
          {DateRangeDropdown}
        </div>
        <div className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">New Opportunities</h2>
            <p className="text-sm text-gray-500 mt-1">Daily count</p>
          </div>
          {DateRangeDropdown}
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
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">New Opportunities</h2>
          <p className="text-sm text-gray-500 mt-1">Daily count</p>
        </div>
        {DateRangeDropdown}
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="dateLabel"
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
            <Bar
              dataKey="count"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
