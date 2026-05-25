import { WorkLog as DBWorkLog, WorkType as DBWorkType } from '@prisma/client';
import { WorkLog } from '@domain/WorkLog.entity';
import { WorkTypeMapper } from './WorkType.mapper';

/**
 * Тип, представляющий структуру записи журнала из БД Prisma,
 * включая опциональную реляционную связь с типом работы.
 */
type DBWorkLogWithRelations = DBWorkLog & {
  workType?: DBWorkType;
};

/**
 * Маппер для преобразования сущностей WorkLog между доменным слоем (Domain)
 * и инфраструктурным слоем базы данных (Persistence/Prisma).
 */
export class WorkLogMapper {
  /**
   * Преобразует сырые данные из базы данных (Prisma) в чистую доменную сущность WorkLog.
   * 
   * @param raw - Сырые данные записи журнала из БД (с подгруженными связями)
   * @returns Доменная сущность WorkLog
   */
  static toDomain(raw: DBWorkLogWithRelations): WorkLog {
    return new WorkLog(
      raw.id,
      raw.date,
      raw.workTypeId,
      raw.workType ? WorkTypeMapper.toDomain(raw.workType) : null,
      raw.volume,
      raw.executorName,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  /**
   * Преобразует доменную сущность WorkLog в объект, готовый для сохранения в БД Prisma.
   * 
   * @param domain - Доменная сущность
   * @returns Объект для сохранения в БД Prisma (без реляционных сущностей)
   */
  static toPersistence(domain: WorkLog) {
    return {
      id: domain.id,
      date: domain.date,
      workTypeId: domain.workTypeId,
      volume: domain.volume,
      executorName: domain.executorName,
    };
  }
}

