import React from 'react';
import { Calendar, Search, Eraser } from 'lucide-react';
import styles from './WorkLogFilters.module.scss';

interface WorkLogFiltersProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  clearFilters: () => void;
}

export const WorkLogFilters: React.FC<WorkLogFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchQuery,
  setSearchQuery,
  clearFilters,
}) => {
  const isFiltered = !!(startDate || endDate || searchQuery);

  return (
    <div className={`${styles.container} ${isFiltered ? styles.active : ''}`}>
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
            max={endDate || undefined}
            onChange={(e) => {
              const val = e.target.value;
              setStartDate(val);
              if (val && endDate && new Date(val) > new Date(endDate)) {
                setEndDate(val); // Auto-bump end date if start is later
              }
            }}
            placeholder="С"
            onClick={(e) => e.currentTarget.showPicker?.()}
          />
        </div>
        <span className={styles.divider}>—</span>
        <div className={styles.inputGroup}>
          <Calendar size={16} className={styles.icon} />
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              const val = e.target.value;
              setEndDate(val);
              if (val && startDate && new Date(val) < new Date(startDate)) {
                setStartDate(val); // Auto-bump start date if end is earlier
              }
            }}
            placeholder="По"
            onClick={(e) => e.currentTarget.showPicker?.()}
          />
        </div>
      </div>

      <div className={`${styles.actions} ${isFiltered ? styles.active : ''}`}>
        <button
          className={styles.clearBtn}
          onClick={clearFilters}
          type="button"
          tabIndex={isFiltered ? 0 : -1}
          title="Сбросить все фильтры"
        >
          <Eraser size={16} />
        </button>
      </div>
    </div>
  );
};
