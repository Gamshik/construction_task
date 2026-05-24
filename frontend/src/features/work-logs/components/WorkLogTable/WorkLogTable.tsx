import React from 'react';
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
  sortOrder: 'asc' | 'desc';
  setSortOrder: (val: 'asc' | 'desc') => void;
}

export const WorkLogTable: React.FC<WorkLogTableProps> = ({
  workLogs,
  onEdit,
  onDelete,
  isDeleting,
  isLoading,
  sortOrder,
  setSortOrder,
}) => {
  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={handleSortToggle} className={styles.sortableHeader}>
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
              <th>Объем</th>
              <th>Исполнитель</th>
              <th style={{ width: '115px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((i) => (
              <tr key={i} className={styles.row}>
                <td><Skeleton width="90px" height="18px" /></td>
                <td><Skeleton width="180px" height="18px" /></td>
                <td><Skeleton width="60px" height="18px" /></td>
                <td><Skeleton width="130px" height="18px" /></td>
                <td><Skeleton width="60px" height="18px" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (workLogs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Inbox size={48} className={styles.emptyIcon} />
        <h3>Журнал работ пуст</h3>
        <p>Не найдено ни одной записи. Измените параметры фильтрации или добавьте новую запись.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={handleSortToggle} className={styles.sortableHeader}>
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
            <th>Объем</th>
            <th>Исполнитель</th>
            <th style={{ width: '115px' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {workLogs.map((log) => (
            <WorkLogTableRow
              key={log.id}
              log={log}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
