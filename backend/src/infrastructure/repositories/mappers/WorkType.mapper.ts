import { WorkType as DBWorkType } from '@prisma/client';
import { WorkType } from '@domain/WorkType.entity';

/**
 * Маппер для преобразования справочника типов работ (WorkType)
 * между доменной сущностью и представлением в базе данных Prisma.
 */
export class WorkTypeMapper {
  /**
   * Преобразует запись типа работы из Prisma в чистую доменную сущность WorkType.
   * 
   * @param raw - Запись типа работы из БД
   * @returns Доменная сущность WorkType
   */
  static toDomain(raw: DBWorkType): WorkType {
    return new WorkType(raw.id, raw.title, raw.unit);
  }

  /**
   * Преобразует доменную сущность WorkType в формат модели Prisma для сохранения.
   * 
   * @param domain - Доменная сущность
   * @returns Объект для сохранения в БД Prisma
   */
  static toPersistence(domain: WorkType): DBWorkType {
    return {
      id: domain.id,
      title: domain.title,
      unit: domain.unit,
    };
  }
}

