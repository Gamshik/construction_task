import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { WorkLog, WorkType } from '@/types';
import { Button } from '@/components';
import { formatDateToInputValue, getTodayInputValue } from '@/utils';
import styles from './WorkLogForm.module.scss';

/**
 * Свойства компонента формы WorkLogForm.
 */
interface WorkLogFormProps {
  /** Список доступных типов (видов) работ */
  workTypes: WorkType[];
  /** Исходные данные для редактирования лога (null при создании новой записи) */
  initialData?: WorkLog | null;
  /**
   * Функция обратного вызова при успешной отправке формы.
   * Принимает очищенные валидные данные лога.
   */
  onSubmit: (data: {
    date: string;
    workTypeId: string;
    volume: number;
    executorName: string;
  }) => void;
  /** Флаг выполнения запроса отправки (блокирует форму и показывает лоадер) */
  isSubmitting: boolean;
  /** Флаг успешного сохранения (для анимации чекбокса успеха) */
  isSuccess?: boolean;
  /** Функция обратного вызова при нажатии кнопки отмены */
  onCancel: () => void;
}

/**
 * Компонент формы создания/редактирования записи в журнале работ.
 * Валидирует заполненные поля и отображает сообщения об ошибках.
 * 
 * @param props Свойства формы
 * @returns React-компонент WorkLogForm
 */
export const WorkLogForm: React.FC<WorkLogFormProps> = ({
  workTypes,
  initialData,
  onSubmit,
  isSubmitting,
  isSuccess = false,
  onCancel,
}) => {
  const [date, setDate] = useState('');
  const [workTypeId, setWorkTypeId] = useState('');
  const [volume, setVolume] = useState<number | ''>('');
  const [executorName, setExecutorName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Синхронизация полей формы при изменении редактируемой записи
  useEffect(() => {
    if (initialData) {
      setDate(formatDateToInputValue(initialData.date));
      setWorkTypeId(initialData.workTypeId);
      setVolume(initialData.volume);
      setExecutorName(initialData.executorName);
    } else {
      setDate(getTodayInputValue());
      setWorkTypeId('');
      setVolume('');
      setExecutorName('');
    }
    setErrors({});
  }, [initialData]);

  const selectedWorkType = workTypes.find((wt) => wt.id === workTypeId);

  /**
   * Проверяет заполненность и корректность полей формы.
   * 
   * @returns Флаг валидности формы (true, если ошибок нет)
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!date) {
      newErrors.date = 'Выберите дату выполнения';
    }
    
    if (!workTypeId) {
      newErrors.workTypeId = 'Выберите вид работы';
    }

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

  /**
   * Обработчик отправки формы.
   * Предотвращает стандартное поведение страницы, валидирует и вызывает onSubmit.
   */
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
          onClick={(e) => e.currentTarget.showPicker?.()}
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
          disabled={isSubmitting || isSuccess}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting && !isSuccess}
          className={`${styles.submitBtn} ${isSuccess ? styles.success : ''}`}
          disabled={isSubmitting || isSuccess}
        >
          {isSuccess ? (
            <Check size={18} className={styles.checkIcon} />
          ) : (
            <span className={styles.btnText}>
              {initialData ? 'Сохранить' : 'Записать работу'}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
