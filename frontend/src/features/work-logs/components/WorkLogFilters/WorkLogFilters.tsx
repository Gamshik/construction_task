import React from 'react';
import { Calendar, Search, ArrowUpDown } from 'lucide-react';
import styles from './WorkLogFilters.module.scss';

interface WorkLogFiltersProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (val: 'asc' | 'desc') => void;
  clearFilters: () => void;
}

export const WorkLogFilters: React.FC<WorkLogFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
  clearFilters,
}) => {
  const isFiltered = startDate || endDate || searchQuery;

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <Search size={18} className={styles.icon} />
        <input
          type="text"
          placeholder="Поиск по исполнителю или работе..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.dateRange}>
        <div className={styles.inputGroup}>
          <Calendar size={16} className={styles.icon} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="С"
          />
        </div>
        <span className={styles.divider}>—</span>
        <div className={styles.inputGroup}>
          <Calendar size={16} className={styles.icon} />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="По"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.sortBtn} ${sortOrder === 'asc' ? styles.asc : ''}`}
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          title="Сортировать по дате"
        >
          <ArrowUpDown size={16} />
          <span>{sortOrder === 'desc' ? 'Сначала новые' : 'Сначала старые'}</span>
        </button>

        {isFiltered && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
};
