/**
 * RecentActivity Component
 * Displays recent audit log entries with badges and relative timestamps
 */

import type { AuditLog } from './hooks/useDashboardData';
import { formatRelativeTime } from './hooks/useDashboardData';
import { Skeleton } from '../../ui/skeleton';

interface RecentActivityProps {
  activities: AuditLog[];
  isLoading?: boolean;
}

// Action badge colors matching the audit logs page
const actionColors: Record<string, { bg: string; text: string }> = {
  LOGIN: { bg: 'bg-green-100', text: 'text-green-800' },
  LOGIN_FAILED: { bg: 'bg-red-100', text: 'text-red-800' },
  LOGOUT: { bg: 'bg-gray-100', text: 'text-gray-800' },
  QUOTE_UPDATED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  QUOTE_SYNCED: { bg: 'bg-purple-100', text: 'text-purple-800' },
  DOCUMENT_UPLOADED: { bg: 'bg-amber-100', text: 'text-amber-800' },
  DOCUMENT_DELETED: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

// Action icons
function ActionIcon({ action }: { action: string }) {
  const iconClass = 'w-4 h-4';

  switch (action) {
    case 'LOGIN':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      );
    case 'LOGIN_FAILED':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'LOGOUT':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      );
    case 'QUOTE_UPDATED':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case 'QUOTE_SYNCED':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'DOCUMENT_UPLOADED':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      );
    case 'DOCUMENT_DELETED':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

// Format action label for display
function formatActionLabel(action: string): string {
  return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

// Get activity description
function getActivityDescription(activity: AuditLog): string {
  const details = activity.details as Record<string, unknown> | null;

  switch (activity.action) {
    case 'LOGIN':
      return `${activity.username} logged in`;
    case 'LOGIN_FAILED':
      const username = details?.username || 'Unknown';
      return `Failed login attempt for "${username}"`;
    case 'LOGOUT':
      return `${activity.username} logged out`;
    case 'QUOTE_UPDATED':
      const changes = details?.changes as { field: string; from: unknown; to: unknown }[] | undefined;
      if (changes?.length) {
        const summary = changes
          .map(c => `${c.field}: ${c.from ?? '(empty)'} \u2192 ${c.to ?? '(empty)'}`)
          .join(', ');
        return `${activity.username} updated ${summary}`;
      }
      const fields = details?.fields as string[] | undefined;
      if (fields?.length) {
        return `${activity.username} updated ${fields.join(', ')}`;
      }
      return `${activity.username} updated a quote`;
    case 'QUOTE_SYNCED':
      return `${activity.username} synced quote with CRM`;
    case 'DOCUMENT_UPLOADED':
      const filename = details?.filename as string | undefined;
      return filename
        ? `${activity.username} uploaded "${filename}"`
        : `${activity.username} uploaded a document`;
    case 'DOCUMENT_DELETED':
      const deletedFile = details?.filename as string | undefined;
      return deletedFile
        ? `${activity.username} deleted "${deletedFile}"`
        : `${activity.username} deleted a document`;
    default:
      return `${activity.username} performed ${formatActionLabel(activity.action)}`;
  }
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full">
        <div className="px-6 py-4 border-b border-gray-100">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <p className="text-sm text-gray-500 mt-1">Latest actions on the dashboard</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-6 flex items-center justify-center h-full min-h-[200px]">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-500 text-sm">No recent activity</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activities.map((activity) => {
              const colors = actionColors[activity.action] || {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
              };

              return (
                <li
                  key={activity.id}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center`}
                    >
                      <ActionIcon action={activity.action} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <a
          href="/adminpanel/audit-logs"
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View all activity
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
