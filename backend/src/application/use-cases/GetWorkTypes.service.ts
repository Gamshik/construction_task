import { Inject, Injectable } from '@nestjs/common';
import { WorkType } from '@domain/WorkType.entity';
import { WorkTypeRepositoryPort } from '@application/ports/WorkTypeRepository.interface';

/**
 * Сервис (сценарий использования) получения списка всех типов строительных работ.
 * Используется для формирования справочника/выпадающих списков.
 */
@Injectable()
export class GetWorkTypesService {
  constructor(
    @Inject('WorkTypeRepositoryPort')
    private readonly workTypeRepository: WorkTypeRepositoryPort,
  ) {}

  /**
   * Получает все доступные типы работ.
   * 
   * @returns Массив доменных сущностей WorkType
   */
  async execute(): Promise<WorkType[]> {
    return this.workTypeRepository.findAll();
  }
}

