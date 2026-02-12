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
import { Building2, X } from 'lucide-react';

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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFilter({ manufacturer: null });
  };

  const isFiltered = filter.manufacturer !== null;

  return (
    <div className={`relative ${className ?? ''}`}>
      <Select
        value={filter.manufacturer ?? 'all'}
        onValueChange={handleChange}
      >
        <SelectTrigger className={`w-[180px] bg-white ${isFiltered ? 'pr-8' : ''}`}>
          <Building2 className={`w-4 h-4 mr-2 ${isFiltered ? 'text-primary' : 'text-gray-400'}`} />
          <SelectValue placeholder={t('allManufacturers')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allManufacturers')}</SelectItem>
          <SelectItem value="DURLEVEL">Durlevel</SelectItem>
          <SelectItem value="AUSRESON">Ausreson</SelectItem>
          <SelectItem value="EKANG">Ekang</SelectItem>
          <SelectItem value="RICHTEK">Richtek</SelectItem>
        </SelectContent>
      </Select>
      {isFiltered && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title={t('clearFilter')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default ManufacturerFilter;
