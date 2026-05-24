import React, { useState, useEffect } from 'react';
import { WorkLog, WorkType } from '@/api/workLogsApi';
import { Button } from '@/components/Button/Button';
import styles from './WorkLogForm.module.scss';

interface WorkLogFormProps {
  workTypes: WorkType[];
  initialData?: WorkLog | null;
  onSubmit: (data: {
    date: string;
    workTypeId: string;
    volume: number;
    executorName: string;
  }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const WorkLogForm: React.FC<WorkLogFormProps> = ({
  workTypes,
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const [date, setDate] = useState('');
  const [workTypeId, setWorkTypeId] = useState('');
  const [volume, setVolume] = useState<number | ''>('');
  const [executorName, setExecutorName] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      const d = new Date(initialData.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setWorkTypeId(initialData.workTypeId);
      setVolume(initialData.volume);
      setExecutorName(initialData.executorName);
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setWorkTypeId('');
      setVolume('');
      setExecutorName('');
    }
    setErrors({});
  }, [initialData]);

  const selectedWorkType = workTypes.find((wt) => wt.id === workTypeId);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = 'Выберите дату выполнения';
    if (!workTypeId) newErrors.workTypeId = 'Выберите вид работы';
    
    if (volume === '') {
      newErrors.volume = 'Укажите объем выполненных работ';
    } else if (Number(volume) <= 0) {
      newErrors.volume = 'Объем должен быть больше нуля';
    }

    if (!executorName.trim()) {
      newErrors.executorName = 'Введите ФИО исполнителя (бригадира)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const isoDate = new Date(date).toISOString();

    onSubmit({
      date: isoDate,
      workTypeId,
      volume: Number(volume),
      executorName: executorName.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="date">Дата выполнения</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={errors.date ? styles.inputError : ''}
        />
        {errors.date && <span className={styles.errorText}>{errors.date}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="workType">Вид работы</label>
        <select
          id="workType"
          value={workTypeId}
          onChange={(e) => setWorkTypeId(e.target.value)}
          className={errors.workTypeId ? styles.inputError : ''}
        >
          <option value="">-- Выберите вид работы --</option>
          {workTypes.map((wt) => (
            <option key={wt.id} value={wt.id}>
              {wt.title}
            </option>
          ))}
        </select>
        {errors.workTypeId && (
          <span className={styles.errorText}>{errors.workTypeId}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="volume">Объем работ</label>
        <div className={styles.inputWithUnit}>
          <input
            type="number"
            id="volume"
            step="any"
            placeholder="Например, 24"
            value={volume}
            onChange={(e) => {
              const val = e.target.value;
              setVolume(val === '' ? '' : Number(val));
            }}
            className={errors.volume ? styles.inputError : ''}
          />
          {selectedWorkType && (
            <span className={styles.unitBadge}>{selectedWorkType.unit}</span>
          )}
        </div>
        {errors.volume && <span className={styles.errorText}>{errors.volume}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="executorName">Исполнитель (ФИО)</label>
        <input
          type="text"
          id="executorName"
          placeholder="ФИО бригадира или рабочего"
          value={executorName}
          onChange={(e) => setExecutorName(e.target.value)}
          className={errors.executorName ? styles.inputError : ''}
        />
        {errors.executorName && (
          <span className={styles.errorText}>{errors.executorName}</span>
        )}
      </div>

      <div className={styles.formActions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Отмена
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialData ? 'Сохранить изменения' : 'Добавить запись'}
        </Button>
      </div>
    </form>
  );
};
