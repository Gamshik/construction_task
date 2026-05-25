import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkLogRepositoryPort } from '@application/ports/WorkLogRepository.interface';

/**
 * Сервис (сценарий использования) удаления записи из журнала работ.
 * Проверяет существование записи перед её удалением.
 */
@Injectable()
export class DeleteWorkLogService {
  constructor(
    @Inject('WorkLogRepositoryPort')
    private readonly workLogRepository: WorkLogRepositoryPort,
  ) {}

  /**
   * Выполняет удаление записи по идентификатору.
   * 
   * @param id - Уникальный идентификатор записи
   * @throws {NotFoundException} Если запись не найдена в системе
   */
  async execute(id: string): Promise<void> {
    // 1. Проверяем наличие записи
    const existing = await this.workLogRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`WorkLog with ID ${id} not found`);
    }
    
    // 2. Удаляем запись через порт репозитория
    await this.workLogRepository.delete(id);
  }
}

