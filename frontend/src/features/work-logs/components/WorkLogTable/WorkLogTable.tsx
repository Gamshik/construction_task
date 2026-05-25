import React, { useState, useEffect, useRef } from 'react';
import type { WorkLog, SortOrder } from '@/types';
import { WorkLogTableRow } from './WorkLogTableRow';
import { renderSkeletonRows, PaginationSkeleton } from './WorkLogTableSkeleton';
import { Inbox, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './WorkLogTable.module.scss';

/**
 * Свойства компонента таблицы логов работ WorkLogTable.
 */
interface WorkLogTableProps {
  /** Список логов работ для отображения */
  workLogs: WorkLog[];
  /** Функция обратного вызова для редактирования записи */
  onEdit: (log: WorkLog) => void;
  /** Функция обратного вызова для удаления записи по идентификатору */
  onDelete: (id: string) => void;
  /** Флаг выполнения запроса удаления (блокирует кнопки) */
  isDeleting: boolean;
  /** Флаг состояния первичной загрузки данных */
  isLoading: boolean;
  /** Флаг любого фонового запроса данных (для отображения спиннеров) */
  isFetching: boolean;
  /** Текущее направление сортировки */
  sortOrder: SortOrder;
  /** Функция обратного вызова для переключения направления сортировки */
  setSortOrder: (val: SortOrder) => void;
  /** Идентификатор вновь добавленного лога для визуальной подсветки */
  newLogId?: string | null;
  /** Идентификатор обновленного лога для визуальной подсветки */
  updatedLogId?: string | null;
  /** Функция обратного вызова для загрузки следующей страницы пагинации */
  onLoadMore: () => void;
  /** Флаг наличия следующей страницы для загрузки */
  hasNextPage: boolean;
  /** Флаг выполнения запроса загрузки следующей страницы */
  isFetchingNextPage: boolean;
  /** Лимит записей на одну страницу */
  limit: number;
  /** Функция обратного вызова для изменения лимита записей на странице */
  setLimit: (val: number) => void;
  /** Общее количество записей, удовлетворяющих фильтру на сервере */
  totalLogsCount: number;
}

/**
 * Компонент таблицы выполненных работ.
 * Отображает список записей, управляет состояниями пустой таблицы, сортировки и пагинации.
 * Использует оптимизированный Skeleton-лоадер с задержкой в 200мс для предотвращения мигания интерфейса.
 * 
 * @param props Свойства таблицы
 * @returns React-компонент WorkLogTable
 */
export const WorkLogTable: React.FC<WorkLogTableProps> = ({
  workLogs,
  onEdit,
  onDelete,
  isDeleting,
  isLoading,
  isFetching,
  sortOrder,
  setSortOrder,
  newLogId = null,
  updatedLogId = null,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  limit,
  setLimit,
  totalLogsCount,
}) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const prevCountRef = useRef(limit);
  const wasEmptyRef = useRef(false);

  // Синхронизация лимита для запоминания предыдущего количества строк
  useEffect(() => {
    prevCountRef.current = limit;
  }, [limit]);

  // Запоминаем, был ли список пуст на предыдущей успешной загрузке
  useEffect(() => {
    if (!isLoading && !isFetching) {
      wasEmptyRef.current = workLogs.length === 0;
    }
  }, [workLogs, isLoading, isFetching]);

  // Фиксируем последнее ненулевое количество строк для предотвращения скачков высоты таблицы
  useEffect(() => {
    if (workLogs.length > 0) {
      prevCountRef.current = workLogs.length;
    }
  }, [workLogs]);

  // Показываем скелетон с задержкой 200мс, чтобы избежать мерцания на быстрых соединениях
  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [isLoading]);

  /**
   * Переключает направление сортировки по дате (asc <-> desc).
   */
  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const isRefetchingEmpty = workLogs.length === 0 && isFetching && !wasEmptyRef.current;
  const isSkeletonActive = (showSkeleton || isRefetchingEmpty) && !wasEmptyRef.current;

  // Отрисовка пустого состояния таблицы
  if (workLogs.length === 0 && !isSkeletonActive) {
    const isFetchingEmpty = isFetching;
    return (
      <div className={`${styles.emptyState} ${isFetchingEmpty ? styles.loadingEmpty : ''}`}>
        <Inbox size={48} className={styles.emptyIcon} />
        <h3>Журнал работ пуст</h3>
        <p>Не найдено ни одной записи. Измените параметры фильтрации или добавьте новую запись.</p>
        {isFetchingEmpty && (
          <div className={styles.liquidCurrent}>
            <svg>
              <defs>
                <linearGradient id="currentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="var(--accent-color)" />
                  <stop offset="50%" stop-color="rgba(0, 113, 227, 0.4)" />
                  <stop offset="100%" stop-color="transparent" />
                </linearGradient>
              </defs>
              <rect pathLength="1000" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  const visibleCount = workLogs.length;
  const percentage = totalLogsCount > 0 ? Math.round((visibleCount / totalLogsCount) * 100) : 0;

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <colgroup>
            <col width="150" />
            <col />
            <col width="120" />
            <col width="220" />
            <col width="100" />
          </colgroup>
          <thead>
            <tr>
              <th onClick={handleSortToggle} className={styles.sortableHeader} style={{ width: '150px' }}>
                <div className={styles.headerContent}>
                  <span>Дата</span>
                  {sortOrder === 'asc' ? (
                    <ArrowUp size={12} className={styles.sortIcon} />
                  ) : (
                    <ArrowDown size={12} className={styles.sortIcon} />
                  )}
                </div>
              </th>
              <th>Вид работы</th>
              <th style={{ width: '120px' }}>Объем</th>
              <th style={{ width: '220px' }}>Исполнитель</th>
              <th style={{ width: '100px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {isSkeletonActive ? (
              renderSkeletonRows(prevCountRef.current)
            ) : (
              <>
                {workLogs.map((log) => (
                  <WorkLogTableRow
                    key={log.id}
                    log={log}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                    isNew={newLogId === log.id}
                    isUpdated={updatedLogId === log.id}
                  />
                ))}
                {isFetchingNextPage && renderSkeletonRows(limit)}
              </>
            )}
          </tbody>
        </table>
      </div>

      {isSkeletonActive || isFetchingNextPage ? (
        <PaginationSkeleton />
      ) : (
        totalLogsCount > 0 && (
          <div className={styles.paginationPanel}>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressStats}>
                <span>
                  Отображено: <strong>{visibleCount}</strong> из <strong>{totalLogsCount}</strong> записей
                </span>
                <span className={styles.progressPercent}>{percentage}%</span>
              </div>
              <div className={styles.progressBarBg}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className={styles.paginationActions}>
              <button
                type="button"
                className={`${styles.loadMoreBtn} ${isFetchingNextPage ? styles.loading : ''}`}
                onClick={onLoadMore}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                <div className={styles.spinner} />
                <span>
                  {isFetchingNextPage
                    ? 'Загрузка...'
                    : hasNextPage
                    ? `Показать еще +${limit}`
                    : 'Все данные загружены'}
                </span>
              </button>

              <div className={styles.limitSelectorWrapper}>
                <span className={styles.limitLabel}>Показывать по:</span>
                <select
                  className={styles.limitSelect}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};
