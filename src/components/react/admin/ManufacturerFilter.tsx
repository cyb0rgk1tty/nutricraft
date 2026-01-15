/**
 * ManufacturerFilter Component
 * Dropdown filter for admins to filter quotes by manufacturer
 * Only visible when user is an admin (userDashboard is null)
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

import type { ManufacturerDashboard } from './types';
import { useQuoteStore } from './stores/quoteStore';
import { useLanguage } from './hooks/useLanguage';

interface ManufacturerFilterProps {
  className?: string;
}

export function ManufacturerFilter({ className }: ManufacturerFilterProps) {
  const { filter, setFilter, userDashboard } = useQuoteStore();
  const { t } = useLanguage();

  // Only show for admins (userDashboard is null)
  // Manufacturers already have their data filtered server-side
  if (userDashboard !== null) {
    return null;
  }

  const handleChange = (value: string) => {
    // Convert 'all' to null, otherwise use the manufacturer value
    const manufacturer = value === 'all' ? null : (value as ManufacturerDashboard);
    setFilter({ manufacturer });
  };

  return (
    <div className={className}>
      <Select
        value={filter.manufacturer ?? 'all'}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-[180px] bg-white">
          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
          <SelectValue placeholder={t('allManufacturers')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allManufacturers')}</SelectItem>
          <SelectItem value="DURLEVEL">Durlevel</SelectItem>
          <SelectItem value="AUSRESON">Ausreson</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default ManufacturerFilter;
