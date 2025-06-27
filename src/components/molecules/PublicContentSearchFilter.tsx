'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { ContentTypeBadge } from '@/components/atoms/ContentTypeBadge';
import { PublicContentFilters, ContentCategory } from '@/lib/types/public-content';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  ChevronDown,
  RotateCcw
} from 'lucide-react';

interface PublicContentSearchFilterProps {
  filters: PublicContentFilters;
  onFiltersChange: (filters: PublicContentFilters) => void;
  availableCategories?: string[];
  showAdvancedFilters?: boolean;
  className?: string;
}

const CONTENT_TYPES = ['video', 'audio', 'stream', 'live_recording'] as const;
const SORT_OPTIONS = [
  { value: 'created_at', label: 'Recently Added' },
  { value: 'view_count', label: 'Most Viewed' },
  { value: 'truth_percentage', label: 'Truth Percentage' },
  { value: 'title', label: 'Title (A-Z)' },
] as const;

const TRUTH_PERCENTAGE_RANGES = [
  { label: 'Highly Accurate (80%+)', min: 80, max: 100 },
  { label: 'Mostly Accurate (60-79%)', min: 60, max: 79 },
  { label: 'Mixed Results (40-59%)', min: 40, max: 59 },
  { label: 'Requires Caution (<40%)', min: 0, max: 39 },
] as const;

/**
 * Public Content Search & Filter Molecule Component
 * Comprehensive filtering system for public content gallery
 * Includes search, category, content type, and truth percentage filters
 */
export function PublicContentSearchFilter({
  filters,
  onFiltersChange,
  availableCategories = [],
  showAdvancedFilters = true,
  className,
}: PublicContentSearchFilterProps) {
  const { t } = useTranslation(['gallery', 'common']);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFiltersChange({ ...filters, search: searchTerm, offset: 0 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters, onFiltersChange]);

  const handleFilterChange = (newFilters: Partial<PublicContentFilters>) => {
    onFiltersChange({ ...filters, ...newFilters, offset: 0 });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    onFiltersChange({
      limit: filters.limit,
      offset: 0,
    });
  };

  const hasActiveFilters = () => {
    return Boolean(
      filters.search ||
      filters.content_type ||
      filters.category ||
      filters.min_truth_percentage !== undefined ||
      filters.max_truth_percentage !== undefined ||
      (filters.sort_by && filters.sort_by !== 'created_at')
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.content_type) count++;
    if (filters.category) count++;
    if (filters.min_truth_percentage !== undefined || filters.max_truth_percentage !== undefined) count++;
    if (filters.sort_by && filters.sort_by !== 'created_at') count++;
    return count;
  };

  const toggleTruthPercentageRange = (range: typeof TRUTH_PERCENTAGE_RANGES[number]) => {
    const isSelected = filters.min_truth_percentage === range.min && filters.max_truth_percentage === range.max;
    
    if (isSelected) {
      handleFilterChange({
        min_truth_percentage: undefined,
        max_truth_percentage: undefined,
      });
    } else {
      handleFilterChange({
        min_truth_percentage: range.min,
        max_truth_percentage: range.max,
      });
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('gallery:filters.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Content Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3 w-3 mr-2" />
                {t('gallery:filters.mediaType')}
                {filters.content_type && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1">
                    1
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>{t('gallery:filters.mediaType')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CONTENT_TYPES.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.content_type === type}
                  onCheckedChange={(checked) => {
                    handleFilterChange({
                      content_type: checked ? type : undefined,
                    });
                  }}
                >
                  <ContentTypeBadge 
                    type={type} 
                    variant="minimal" 
                    size="sm"
                    className="mr-2"
                  />
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {t('gallery:filters.category')}
                  {filters.category && (
                    <Badge variant="secondary" className="ml-2 h-4 px-1">
                      1
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableCategories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={filters.category === category}
                    onCheckedChange={(checked) => {
                      handleFilterChange({
                        category: checked ? category : undefined,
                      });
                    }}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Truth Percentage Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Truth %
                {(filters.min_truth_percentage !== undefined || filters.max_truth_percentage !== undefined) && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1">
                    1
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Truth Percentage Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TRUTH_PERCENTAGE_RANGES.map((range, index) => {
                const isSelected = filters.min_truth_percentage === range.min && filters.max_truth_percentage === range.max;
                return (
                  <DropdownMenuCheckboxItem
                    key={index}
                    checked={isSelected}
                    onCheckedChange={() => toggleTruthPercentageRange(range)}
                  >
                    {range.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <SlidersHorizontal className="h-3 w-3 mr-2" />
                Sort
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filters.sort_by === option.value}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleFilterChange({
                        sort_by: option.value,
                        sort_direction: option.value === 'title' ? 'asc' : 'desc',
                      });
                    }
                  }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters() && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-muted-foreground hover:text-foreground"
              onClick={clearAllFilters}
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              Clear ({getActiveFilterCount()})
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange({ search: undefined })}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            
            {filters.content_type && (
              <Badge variant="secondary" className="gap-1">
                Type: {filters.content_type.replace('_', ' ')}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange({ content_type: undefined })}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}

            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {filters.category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange({ category: undefined })}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}

            {(filters.min_truth_percentage !== undefined || filters.max_truth_percentage !== undefined) && (
              <Badge variant="secondary" className="gap-1">
                Truth: {filters.min_truth_percentage}%-{filters.max_truth_percentage}%
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange({ 
                    min_truth_percentage: undefined,
                    max_truth_percentage: undefined 
                  })}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 