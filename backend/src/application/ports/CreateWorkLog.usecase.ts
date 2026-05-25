import { WorkLog } from '@domain/WorkLog.entity';

/**
 * Команда для создания новой записи в журнале работ.
 * Содержит все необходимые параметры для инициализации сущности WorkLog.
 */
export interface CreateWorkLogCommand {
  /** Дата выполнения строительных работ */
  date: Date;
  /** Идентификатор типа выполненных работ */
  workTypeId: string;
  /** Объем выполненных работ (должен быть больше нуля) */
  volume: number;
  /** ФИО или наименование исполнителя (прораба) */
  executorName: string;
}

/**
 * Интерфейс (входной порт) сценария использования по созданию записи в журнале.
 */
export interface CreateWorkLogUseCase {
  /**
   * Выполняет бизнес-сценарий создания новой записи в журнале.
   * 
   * @param command - Параметры команды для создания
   * @returns Созданная и сохраненная сущность WorkLog
   */
  execute(command: CreateWorkLogCommand): Promise<WorkLog>;
}

