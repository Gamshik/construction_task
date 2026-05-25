import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, FileText, BarChart, Edit2, Trash2, CheckCircle, X } from 'lucide-react';
import type { WorkLog } from '@/types';
import { formatDateRussian } from '@/utils';
import styles from './WorkLogTable.module.scss';

/**
 * Свойства компонента строки таблицы WorkLogTableRow.
 */
interface WorkLogTableRowProps {
  /** Данные записи лога работы для отрисовки */
  log: WorkLog;
  /** Функция обратного вызова для редактирования записи */
  onEdit: (log: WorkLog) => void;
  /** Функция обратного вызова для удаления записи по идентификатору */
  onDelete: (id: string) => void;
  /** Флаг выполнения запроса удаления (блокирует кнопки) */
  isDeleting: boolean;
  /** Флаг того, что запись только что создана (для подсветки и плавной прокрутки) */
  isNew?: boolean;
  /** Флаг того, что запись только что изменена (для подсветки и плавной прокрутки) */
  isUpdated?: boolean;
}

/**
 * Компонент строки таблицы журнала работ.
 * Содержит локальную логику подтверждения удаления записи с плавной анимацией скрытия.
 * Автоматически скроллит к строке при ее добавлении/обновлении.
 * 
 * @param props Свойства строки таблицы
 * @returns React-компонент WorkLogTableRow
 */
export const WorkLogTableRow: React.FC<WorkLogTableRowProps> = ({
  log,
  onEdit,
  onDelete,
  isDeleting,
  isNew = false,
  isUpdated = false,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);

  // Скроллинг к новой или обновленной строке после закрытия модального окна
  useEffect(() => {
    if ((isNew || isUpdated) && rowRef.current) {
      const timer = setTimeout(() => {
        rowRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isNew, isUpdated]);

  /**
   * Подтверждает удаление, запускает анимацию скрытия и вызывает onDelete.
   */
  const handleDeleteConfirm = () => {
    setIsConfirming(false);
    setIsFadingOut(true);
    
    // Задержка на завершение CSS-анимации исчезновения строки (350мс)
    const timer = setTimeout(() => {
      onDelete(log.id);
    }, 350);
    
    return () => clearTimeout(timer);
  };

  const handleEditClick = () => onEdit(log);
  const handleDeleteRequestClick = () => setIsConfirming(true);
  const handleCancelDeleteClick = () => setIsConfirming(false);

  const formattedDate = formatDateRussian(log.date);
  const workTitle = log.workType?.title || '—';
  const workUnit = log.workType?.unit || '';

  return (
    <tr
      ref={rowRef}
      className={`${styles.row} ${isFadingOut ? styles.fadeOut : ''} ${isConfirming ? styles.rowConfirming : ''} ${isNew ? styles.rowNew : ''} ${isUpdated ? styles.rowUpdated : ''}`}
    >
      <td>
        <div className={styles.cellWithIcon}>
          <Calendar size={15} className={styles.iconMuted} />
          <span title={formattedDate}>{formattedDate}</span>
        </div>
      </td>
      <td>
        <div className={styles.cellWithIcon}>
          <FileText size={15} className={styles.iconAccent} />
          <span className={styles.bold} title={workTitle}>
            {workTitle}
          </span>
        </div>
      </td>
      <td>
        <div className={styles.cellWithIcon}>
          <BarChart size={15} className={styles.iconMuted} />
          <span title={`${log.volume} ${workUnit}`}>
            {log.volume} <span className={styles.unit}>{workUnit}</span>
          </span>
        </div>
      </td>
      <td>
        <div className={styles.cellWithIcon}>
          <User size={15} className={styles.iconMuted} />
          <span title={log.executorName}>{log.executorName}</span>
        </div>
      </td>
      <td>
        <div className={styles.actions}>
          {isConfirming ? (
            <>
              <button
                className={styles.confirmBtn}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                title="Подтвердить удаление"
              >
                <CheckCircle size={15} />
              </button>
              <button
                className={styles.cancelBtn}
                onClick={handleCancelDeleteClick}
                disabled={isDeleting}
                title="Отмена"
              >
                <X size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.editBtn}
                onClick={handleEditClick}
                disabled={isDeleting}
                title="Редактировать запись"
              >
                <Edit2 size={15} />
              </button>
              <button
                className={styles.deleteBtn}
                onClick={handleDeleteRequestClick}
                disabled={isDeleting}
                title="Удалить запись"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
