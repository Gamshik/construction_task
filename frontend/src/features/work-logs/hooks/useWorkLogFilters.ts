import { useState, useMemo } from 'react';
import { WorkLog } from '@/api/workLogsApi';

export const useWorkLogFilters = (workLogs: WorkLog[] = []) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedLogs = useMemo(() => {
    let result = [...workLogs];

    // Filter by search query (executor name or work type title)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.executorName.toLowerCase().includes(q) ||
          (log.workType && log.workType.title.toLowerCase().includes(q))
      );
    }

    // Filter by start date
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((log) => new Date(log.date) >= start);
    }

    // Filter by end date
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.date) <= end);
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [workLogs, startDate, endDate, searchQuery, sortOrder]);

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
