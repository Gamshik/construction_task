import { useState, useEffect } from 'react';
import { WorkLog } from '@/api/workLogsApi';

export const useWorkLogFilters = (workLogs: WorkLog[] = []) => {
  // Helper to read initial URL parameter values
  const getUrlParam = (key: string): string => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || '';
  };

  const [startDate, setStartDate] = useState<string>(() => getUrlParam('startDate'));
  const [endDate, setEndDate] = useState<string>(() => getUrlParam('endDate'));
  const [searchQuery, setSearchQuery] = useState<string>(() => getUrlParam('search'));
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    const sort = getUrlParam('sort');
    return sort === 'asc' || sort === 'desc' ? sort : 'desc';
  });

  // Since filtering now happens on the backend, this is just a direct reference
  const filteredAndSortedLogs = workLogs;

  // Reactively synchronize filter state properties with browser URL query variables
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (searchQuery.trim() !== '') {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }

    if (startDate) {
      params.set('startDate', startDate);
    } else {
      params.delete('startDate');
    }

    if (endDate) {
      params.set('endDate', endDate);
    } else {
      params.delete('endDate');
    }

    if (sortOrder && sortOrder !== 'desc') {
      params.set('sort', sortOrder);
    } else {
      params.delete('sort');
    }

    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? '?' + newSearch : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [searchQuery, startDate, endDate, sortOrder]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    filteredAndSortedLogs,
    clearFilters,
  };
};
