import React from 'react';
import { Skeleton } from '@/components';
import styles from './WorkLogTable.module.scss';

/**
 * Рендерит строки-заглушки (скелетоны) для тела таблицы.
 * Предотвращает скачки макета при загрузке.
 * 
 * @param count Количество строк-заглушек для отрисовки
 * @returns Массив JSX-элементов строк таблицы
 */
export const renderSkeletonRows = (count: number): JSX.Element[] => {
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

/**
 * Вспомогательный компонент заглушки панели пагинации.
 * Отображает загрузочные блоки на месте элементов управления пагинацией.
 * 
 * @returns React-компонент PaginationSkeleton
 */
export const PaginationSkeleton: React.FC = () => {
  return (
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
};
