import { Inject, Injectable } from '@nestjs/common';
import { WorkLog } from '@domain/WorkLog.entity';
import { CreateWorkLogCommand, CreateWorkLogUseCase } from '@application/ports/CreateWorkLog.usecase';
import { WorkLogRepositoryPort } from '@application/ports/WorkLogRepository.interface';
import { WorkTypeRepositoryPort } from '@application/ports/WorkTypeRepository.interface';
import { randomUUID } from 'crypto';

/**
 * Сервис (сценарий использования) создания записи в журнале работ.
 * Проверяет существование типа работы и сохраняет новую запись.
 */
@Injectable()
export class CreateWorkLogService implements CreateWorkLogUseCase {
  constructor(
    @Inject('WorkLogRepositoryPort')
    private readonly workLogRepository: WorkLogRepositoryPort,
    @Inject('WorkTypeRepositoryPort')
    private readonly workTypeRepository: WorkTypeRepositoryPort,
  ) {}

  /**
   * Выполняет операцию создания новой записи в журнале производства работ.
   * 
   * @param command - Параметры команды создания записи
   * @returns Созданная и сохраненная сущность WorkLog
   * @throws {Error} Если указанный тип работы не найден
   */
  async execute(command: CreateWorkLogCommand): Promise<WorkLog> {
    // 1. Проверяем существование указанного типа работы в справочнике
    const workType = await this.workTypeRepository.findById(command.workTypeId);
    if (!workType) {
      throw new Error(`WorkType with ID ${command.workTypeId} not found`);
    }

    // 2. Генерируем уникальный идентификатор для новой записи
    const id = randomUUID();
    
    // 3. Создаем доменную сущность (при создании выполнится внутренняя валидация домена)
    const workLog = new WorkLog(
      id,
      command.date,
      command.workTypeId,
      workType,
      command.volume,
      command.executorName,
    );

    // 4. Сохраняем готовую сущность в БД через выходной порт репозитория
    return this.workLogRepository.create(workLog);
  }
}

