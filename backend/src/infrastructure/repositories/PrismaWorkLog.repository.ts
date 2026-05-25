import { Injectable } from '@nestjs/common';
import { WorkLogRepositoryPort, WorkLogFilterOptions } from '@application/ports/WorkLogRepository.interface';
import { WorkLog } from '@domain/WorkLog.entity';
import { PrismaService } from './Prisma.service';
import { WorkLogMapper } from './mappers/WorkLog.mapper';
import { Prisma } from '@prisma/client';

/**
 * Репозиторий для управления записями в журнале работ (WorkLog) на уровне инфраструктуры через Prisma ORM.
 * Реализует выходной порт WorkLogRepositoryPort.
 */
@Injectable()
export class PrismaWorkLogRepository implements WorkLogRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Находит все записи с возможностью пагинации, поиска по тексту, фильтрации по датам и сортировки.
   * 
   * @param options - Объект параметров фильтрации и пагинации
   * @returns Список доменных сущностей и общее количество записей
   */
  async findAll(options?: WorkLogFilterOptions): Promise<{ workLogs: WorkLog[]; total: number }> {
    const { page, limit, search, startDate, endDate, sort } = options || {};
    
    // Расчет смещения для пагинации
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    // Конструирование фильтра WHERE для запроса к Prisma
    const where: Prisma.WorkLogWhereInput = {};

    // Фильтрация: Полнотекстовый поиск по имени исполнителя или по названию типа работ
    if (search && search.trim() !== '') {
      where.OR = [
        { executorName: { contains: search, mode: 'insensitive' } },
        { workType: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Фильтрация: По диапазону дат проведения работ
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    // Выполнение параллельных запросов на выборку данных и подсчет общего количества
    const [raw, total] = await Promise.all([
      this.prisma.workLog.findMany({
        where,
        include: { workType: true }, // Подгружаем реляционные данные типа работы
        orderBy: [
          { date: sort ?? 'desc' },      // Сортировка по дате выполнения работ
          { createdAt: sort ?? 'desc' }, // Вторичная сортировка по дате создания записи
        ],
        skip,
        take,
      }),
      this.prisma.workLog.count({ where }),
    ]);

    // Возвращаем данные, преобразованные в чистые доменные модели
    return {
      workLogs: raw.map(WorkLogMapper.toDomain),
      total,
    };
  }

  /**
   * Находит одну запись по её идентификатору.
   * 
   * @param id - UUID записи
   * @returns Доменная сущность или null
   */
  async findById(id: string): Promise<WorkLog | null> {
    const raw = await this.prisma.workLog.findUnique({
      where: { id },
      include: { workType: true },
    });
    return raw ? WorkLogMapper.toDomain(raw) : null;
  }

  /**
   * Создает новую запись о работе в БД.
   * 
   * @param workLog - Доменная модель записи
   * @returns Сохраненная доменная модель записи с реляционными связями
   */
  async create(workLog: WorkLog): Promise<WorkLog> {
    const persistenceData = WorkLogMapper.toPersistence(workLog);
    const raw = await this.prisma.workLog.create({
      data: persistenceData,
      include: { workType: true },
    });
    return WorkLogMapper.toDomain(raw);
  }

  /**
   * Обновляет запись о работе в БД.
   * 
   * @param workLog - Доменная модель записи для обновления
   * @returns Сохраненная обновленная доменная модель записи
   */
  async update(workLog: WorkLog): Promise<WorkLog> {
    const persistenceData = WorkLogMapper.toPersistence(workLog);
    const raw = await this.prisma.workLog.update({
      where: { id: workLog.id },
      data: persistenceData,
      include: { workType: true },
    });
    return WorkLogMapper.toDomain(raw);
  }

  /**
   * Удаляет запись о работе из БД.
   * 
   * @param id - UUID записи
   */
  async delete(id: string): Promise<void> {
    await this.prisma.workLog.delete({
      where: { id },
    });
  }
}

