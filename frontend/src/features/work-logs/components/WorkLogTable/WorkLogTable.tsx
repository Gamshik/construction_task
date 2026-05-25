import React, { useState, useEffect } from 'react';
import { WorkLog } from '@/api/workLogsApi';
import { WorkLogTableRow } from './WorkLogTableRow';
import { Skeleton } from '@/components/Loader/Skeleton';
import { Inbox, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './WorkLogTable.module.scss';

interface WorkLogTableProps {
  workLogs: WorkLog[];
  onEdit: (log: WorkLog) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isLoading: boolean;
  isFetching: boolean;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (val: 'asc' | 'desc') => void;
  newLogId?: string | null;
  updatedLogId?: string | null;
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  limit: number;
  setLimit: (val: number) => void;
  totalLogsCount: number;
}

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

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, 200); // 200ms delay to prevent skeleton flickering on extremely fast queries

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const isRefetchingEmpty = workLogs.length === 0 && isFetching;
  const isSkeletonActive = showSkeleton || isRefetchingEmpty;

  // Render empty state ONLY when fully loaded and there are indeed no records
  if (workLogs.length === 0 && !isSkeletonActive) {
    return (
      <div className={styles.emptyState}>
        <Inbox size={48} className={styles.emptyIcon} />
        <h3>Журнал работ пуст</h3>
        <p>Не найдено ни одной записи. Измените параметры фильтрации или добавьте новую запись.</p>
      </div>
    );
  }

  // Unified Pagination Skeleton
  const renderPaginationSkeleton = () => (
    <div className={styles.paginationPanel}>
      <div className={styles.progressBarContainer}>
        <div className={styles.progressStats}>
          <Skeleton width="220px" height="16px" />
          <Skeleton width="32px" height="16px" />
        </div>
        <div className={styles.progressBarBg}>
          <div className={styles.progressBarFill} style={{ width: '0%' }} />
        </div>
      </div>
      <div className={styles.paginationActions}>
        <Skeleton variant="rect" width={180} height={40} />
        <div className={styles.limitSelectorWrapper}>
          <Skeleton width="100px" height="16px" />
          <Skeleton variant="rect" width={70} height={32} />
        </div>
      </div>
    </div>
  );

  // Helper to render skeleton rows
  const renderSkeletonRows = (count: number) => {
    return Array.from({ length: count }, (_, i) => i).map((i) => (
      <tr key={`skeleton-row-${i}`} className={styles.row}>
        <td>
          <div className={styles.cellWithIcon}>
            <Skeleton variant="circle" width={15} height={15} />
            <Skeleton width="90px" height="16px" />
          </div>
        </td>
        <td>
          <div className={styles.cellWithIcon}>
            <Skeleton variant="circle" width={15} height={15} />
            <Skeleton width="180px" height="16px" />
          </div>
        </td>
        <td>
          <div className={styles.cellWithIcon}>
            <Skeleton variant="circle" width={15} height={15} />
            <Skeleton width="60px" height="16px" />
          </div>
        </td>
        <td>
          <div className={styles.cellWithIcon}>
            <Skeleton variant="circle" width={15} height={15} />
            <Skeleton width="130px" height="16px" />
          </div>
        </td>
        <td>
          <div className={styles.actions}>
            <Skeleton variant="rect" width={28} height={28} />
            <Skeleton variant="rect" width={28} height={28} />
          </div>
        </td>
      </tr>
    ));
  };

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
              renderSkeletonRows(limit)
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

      {isSkeletonActive ? (
        renderPaginationSkeleton()
      ) : (
        totalLogsCount > 0 && (
          isFetchingNextPage ? (
            renderPaginationSkeleton()
          ) : (
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
        )
      )}
    </>
  );
};
