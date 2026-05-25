import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkLog } from '@domain/WorkLog.entity';
import { WorkLogRepositoryPort } from '@application/ports/WorkLogRepository.interface';
import { WorkTypeRepositoryPort } from '@application/ports/WorkTypeRepository.interface';

/**
 * Параметры команды для обновления существующей записи в журнале производства работ.
 */
export interface UpdateWorkLogCommand {
  /** Идентификатор существующей записи */
  id: string;
  /** Новая дата проведения работ */
  date: Date;
  /** Идентификатор нового типа работ */
  workTypeId: string;
  /** Объем выполненных работ (должен быть больше нуля) */
  volume: number;
  /** ФИО или наименование исполнителя (прораба) */
  executorName: string;
}

/**
 * Сервис (сценарий использования) обновления записи в журнале работ.
 * Проверяет существование записи и нового типа работы перед сохранением изменений.
 */
@Injectable()
export class UpdateWorkLogService {
  constructor(
    @Inject('WorkLogRepositoryPort')
    private readonly workLogRepository: WorkLogRepositoryPort,
    @Inject('WorkTypeRepositoryPort')
    private readonly workTypeRepository: WorkTypeRepositoryPort,
  ) {}

  /**
   * Выполняет обновление записи в журнале работ.
   * 
   * @param command - Параметры команды на обновление
   * @returns Обновленная и сохраненная сущность WorkLog
   * @throws {NotFoundException} Если обновляемая запись или новый тип работ не найдены
   */
  async execute(command: UpdateWorkLogCommand): Promise<WorkLog> {
    // 1. Проверяем существование обновляемой записи
    const existing = await this.workLogRepository.findById(command.id);
    if (!existing) {
      throw new NotFoundException(`WorkLog with ID ${command.id} not found`);
    }

    // 2. Проверяем существование указанного типа работы в справочнике
    const workType = await this.workTypeRepository.findById(command.workTypeId);
    if (!workType) {
      throw new NotFoundException(`WorkType with ID ${command.workTypeId} not found`);
    }

    // 3. Создаем новый инстанс доменной сущности с обновленными данными
    const updatedWorkLog = new WorkLog(
      command.id,
      command.date,
      command.workTypeId,
      workType,
      command.volume,
      command.executorName,
    );

    // 4. Передаем в репозиторий через порт для сохранения
    return this.workLogRepository.update(updatedWorkLog);
  }
}

