import { Injectable } from '@nestjs/common';
import { WorkTypeRepositoryPort } from '@application/ports/WorkTypeRepository.interface';
import { WorkType } from '@domain/WorkType.entity';
import { PrismaService } from './Prisma.service';
import { WorkTypeMapper } from './mappers/WorkType.mapper';

/**
 * Репозиторий справочника типов строительных работ (WorkType) на уровне инфраструктуры через Prisma ORM.
 * Реализует выходной порт WorkTypeRepositoryPort.
 */
@Injectable()
export class PrismaWorkTypeRepository implements WorkTypeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получает все типы работ, отсортированные по алфавиту по названию.
   * 
   * @returns Массив доменных сущностей WorkType
   */
  async findAll(): Promise<WorkType[]> {
    const raw = await this.prisma.workType.findMany({
      orderBy: { title: 'asc' }, // Сортировка по алфавиту для отображения на UI
    });
    return raw.map(WorkTypeMapper.toDomain);
  }

  /**
   * Находит тип работы по его идентификатору.
   * 
   * @param id - UUID типа работы
   * @returns Доменная сущность WorkType или null
   */
  async findById(id: string): Promise<WorkType | null> {
    const raw = await this.prisma.workType.findUnique({
      where: { id },
    });
    return raw ? WorkTypeMapper.toDomain(raw) : null;
  }
}

