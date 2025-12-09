/**
 * StatusStrip Component
 * Horizontal filter strip showing status counts and allowing filtering
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { QuoteStatus } from './types';
import { STATUS_CONFIG } from './types';
import { useQuoteStore } from './stores/quoteStore';
import { useLanguage } from './hooks/useLanguage';

interface StatusStripProps {
  className?: string;
}

export function StatusStrip({ className }: StatusStripProps) {
  const { statusCounts, filter, setFilter } = useQuoteStore();
  const { t, getStageLabel } = useLanguage();

  const handleStatusClick = (status: QuoteStatus | null) => {
    setFilter({ status: filter.status === status ? null : status });
  };

  // Calculate total count
  const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* All Status Button */}
      <Button
        variant={filter.status === null ? 'default' : 'outline'}
        size="default"
        onClick={() => handleStatusClick(null)}
        className={cn(
          'gap-2',
          filter.status === null && 'bg-primary-light hover:bg-primary-light/90 text-gray-800'
        )}
      >
        {t('all')}
        <Badge
          variant="secondary"
          className={cn(
            'ml-1 h-5 px-1.5 text-sm',
            filter.status === null ? 'bg-white/20 text-white' : 'bg-gray-100'
          )}
        >
          {totalCount}
        </Badge>
      </Button>

      {/* Status Buttons */}
      {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map((status) => {
        const config = STATUS_CONFIG[status];
        const count = statusCounts[status] || 0;
        const isActive = filter.status === status;

        return (
          <Button
            key={status}
            variant={isActive ? 'default' : 'outline'}
            size="default"
            onClick={() => handleStatusClick(status)}
            className={cn(
              'gap-2',
              isActive && 'bg-primary-light hover:bg-primary-light/90 text-gray-800'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                status === 'planning' && 'bg-blue-500',
                status === 'order_samples' && 'bg-amber-500',
                status === 'client_review_samples' && 'bg-purple-500',
                status === 'full_batch_order' && 'bg-green-500'
              )}
            />
            {getStageLabel(status)}
            <Badge
              variant="secondary"
              className={cn(
                'ml-1 h-5 px-1.5 text-sm',
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100'
              )}
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}

export default StatusStrip;
