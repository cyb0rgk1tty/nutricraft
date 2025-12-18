/**
 * QuickNav Component
 * Navigation cards for quick access to admin sections
 */

import { Skeleton } from '../../ui/skeleton';

interface QuickNavProps {
  totalOpportunities?: number;
  announcementActive?: boolean;
  isLoading?: boolean;
}

interface NavCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

function NavCard({ title, description, href, icon, badge, badgeColor = 'bg-primary' }: NavCardProps) {
  return (
    <a
      href={href}
      className="group block bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          {icon}
        </div>
        {badge !== undefined && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor} text-white`}>
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:text-primary-dark transition-colors">
        Open
        <svg
          className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

export function QuickNav({ totalOpportunities, announcementActive, isLoading }: QuickNavProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Quick Access</h2>
        <p className="text-sm text-gray-500 mt-1">Navigate to admin sections</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Quotes Dashboard */}
          <NavCard
            title="Quotes"
            description="Manage quote requests and pricing"
            href="/mandash"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            }
            badge={totalOpportunities}
            badgeColor="bg-primary"
          />

          {/* Settings */}
          <NavCard
            title="Settings"
            description="Site announcements and configuration"
            href="/adminpanel/settings"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
            badge={announcementActive ? 'Active' : undefined}
            badgeColor={announcementActive ? 'bg-amber-500' : undefined}
          />

          {/* Audit Logs */}
          <NavCard
            title="Audit Logs"
            description="View activity and change history"
            href="/adminpanel/audit-logs"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
