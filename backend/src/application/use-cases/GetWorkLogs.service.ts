import { Inject, Injectable } from '@nestjs/common';
import { WorkLog } from '@domain/WorkLog.entity';
import { WorkLogRepositoryPort, WorkLogFilterOptions } from '@application/ports/WorkLogRepository.interface';

/**
 * Сервис (сценарий использования) получения списка записей журнала производства работ.
 * Позволяет фильтровать, сортировать и разбивать результаты на страницы (пагинация).
 */
@Injectable()
export class GetWorkLogsService {
  constructor(
    @Inject('WorkLogRepositoryPort')
    private readonly workLogRepository: WorkLogRepositoryPort,
  ) {}

  /**
   * Получает список записей журнала на основе параметров фильтрации.
   * 
   * @param options - Параметры пагинации, поиска, дат и направления сортировки
   * @returns Объект со списком сущностей WorkLog и общим числом записей (для пагинации)
   */
  async execute(options?: WorkLogFilterOptions): Promise<{ workLogs: WorkLog[]; total: number }> {
    return this.workLogRepository.findAll(options);
  }
}

