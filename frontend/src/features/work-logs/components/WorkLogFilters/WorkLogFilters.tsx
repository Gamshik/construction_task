import React from 'react';
import { Calendar, Search, Eraser } from 'lucide-react';
import styles from './WorkLogFilters.module.scss';

/**
 * Свойства компонента фильтрации логов работ WorkLogFilters.
 */
interface WorkLogFiltersProps {
  /** Выбранная дата начала диапазона (ISO YYYY-MM-DD или пустая строка) */
  startDate: string;
  /** Функция обратного вызова для изменения даты начала диапазона */
  setStartDate: (val: string) => void;
  /** Выбранная дата конца диапазона (ISO YYYY-MM-DD или пустая строка) */
  endDate: string;
  /** Функция обратного вызова для изменения даты конца диапазона */
  setEndDate: (val: string) => void;
  /** Текстовый поисковый запрос (имя исполнителя или тип работы) */
  searchQuery: string;
  /** Функция обратного вызова для изменения поискового запроса */
  setSearchQuery: (val: string) => void;
  /** Функция обратного вызова для сброса всех фильтров в начальное состояние */
  clearFilters: () => void;
}

/**
 * Компонент панели фильтров для поиска и фильтрации записей журнала работ по датам.
 * Автоматически координирует даты начала/конца диапазона (start/end dates) для валидности интервала.
 * 
 * @param props Свойства панели фильтрации
 * @returns React-компонент WorkLogFilters
 */
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

  /**
   * Обработчик клика по контейнеру ввода даты.
   * Программно открывает нативный календарь браузера.
   */
  const handleInputGroupClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const input = e.currentTarget.querySelector('input');
    if (input) {
      input.showPicker?.();
    }
  };

  /**
   * Обработчик изменения начальной даты.
   * Если начальная дата становится позже конечной, конечная дата автоматически подтягивается.
   */
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    if (val && endDate && new Date(val) > new Date(endDate)) {
      setEndDate(val);
    }
  };

  /**
   * Обработчик изменения конечной даты.
   * Если конечная дата становится раньше начальной, начальная дата автоматически подтягивается.
   */
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndDate(val);
    if (val && startDate && new Date(val) < new Date(startDate)) {
      setStartDate(val);
    }
  };

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
        <div className={styles.inputGroup} onClick={handleInputGroupClick}>
          <Calendar size={16} className={styles.icon} />
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={handleStartDateChange}
            placeholder="С"
          />
        </div>
        <span className={styles.divider}>—</span>
        <div className={styles.inputGroup} onClick={handleInputGroupClick}>
          <Calendar size={16} className={styles.icon} />
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={handleEndDateChange}
            placeholder="По"
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
