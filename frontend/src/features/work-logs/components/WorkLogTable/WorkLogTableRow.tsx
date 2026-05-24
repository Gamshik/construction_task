import React, { useState } from 'react';
import { Calendar, User, FileText, BarChart, Edit2, Trash2 } from 'lucide-react';
import { WorkLog } from '@/api/workLogsApi';
import styles from './WorkLogTable.module.scss';

interface WorkLogTableRowProps {
  log: WorkLog;
  onEdit: (log: WorkLog) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const WorkLogTableRow: React.FC<WorkLogTableRowProps> = ({
  log,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleDeleteClick = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onDelete(log.id);
    }, 280);
  };

  const formattedDate = new Date(log.date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <tr className={`${styles.row} ${isFadingOut ? styles.fadeOut : ''}`}>
      <td>
        <div className={styles.cellWithIcon}>
          <Calendar size={15} className={styles.iconMuted} />
          <span>{formattedDate}</span>
        </div>
      </td>
      <td>
        <div className={styles.cellWithIcon}>
          <FileText size={15} className={styles.iconAccent} />
          <span className={styles.bold}>{log.workType?.title || '—'}</span>
        </div>
      </td>
      <td>
        <div className={styles.cellWithIcon}>
          <BarChart size={15} className={styles.iconMuted} />
          <span>
            {log.volume} <span className={styles.unit}>{log.workType?.unit || ''}</span>
          </span>
        </div>
      </td>
      <td>
        <div className={styles.cellWithIcon}>
          <User size={15} className={styles.iconMuted} />
          <span>{log.executorName}</span>
        </div>
      </td>
      <td>
        <div className={styles.actions}>
          <button
            className={styles.editBtn}
            onClick={() => onEdit(log)}
            title="Редактировать запись"
          >
            <Edit2 size={15} />
          </button>
          <button
            className={styles.deleteBtn}
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Удалить запись"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
};
