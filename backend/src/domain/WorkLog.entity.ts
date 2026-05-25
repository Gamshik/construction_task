import { WorkType } from './WorkType.entity';

/**
 * Доменная сущность записи в журнале производства работ.
 * Хранит информацию о дате, типе работы, объеме и исполнителе.
 */
export class WorkLog {
  /**
   * Создает экземпляр WorkLog.
   * 
   * @param id - Уникальный идентификатор записи (UUID)
   * @param date - Дата выполнения работ
   * @param workTypeId - Идентификатор связанного типа работ
   * @param workType - Связанная сущность типа работ (или null, если данные не загружены)
   * @param volume - Объем выполненных работ (должен быть больше нуля)
   * @param executorName - ФИО или наименование исполнителя (прораба)
   * @param createdAt - Дата и время создания записи (заполняется БД)
   * @param updatedAt - Дата и время последнего обновления записи (заполняется БД)
   * @throws {Error} Если переданы некорректные или пустые значения
   */
  constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly workTypeId: string,
    public readonly workType: WorkType | null,
    public readonly volume: number,
    public readonly executorName: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    // Валидация входных доменных данных для обеспечения бизнес-правил
    if (!id) {
      throw new Error('WorkLog id is required');
    }
    if (!date || isNaN(date.getTime())) {
      throw new Error('WorkLog date must be a valid Date');
    }
    if (!workTypeId) {
      throw new Error('WorkLog workTypeId is required');
    }
    if (volume <= 0) {
      throw new Error('WorkLog volume must be greater than zero');
    }
    if (!executorName || executorName.trim().length === 0) {
      throw new Error('WorkLog executorName cannot be empty');
    }
  }
}

