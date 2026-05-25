import { WorkType } from '@domain/WorkType.entity';

/**
 * Интерфейс (выходной порт) репозитория для управления справочником типов работ WorkType.
 */
export interface WorkTypeRepositoryPort {
  /**
   * Возвращает полный список всех доступных типов работ.
   * 
   * @returns Массив сущностей WorkType
   */
  findAll(): Promise<WorkType[]>;

  /**
   * Находит тип работ по его уникальному идентификатору.
   * 
   * @param id - Идентификатор типа работ
   * @returns Найденая сущность WorkType или null
   */
  findById(id: string): Promise<WorkType | null>;
}

