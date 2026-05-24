import { WorkType as DBWorkType } from '@prisma/client';
import { WorkType } from '@domain/WorkType.entity';

export class WorkTypeMapper {
  static toDomain(raw: DBWorkType): WorkType {
    return new WorkType(raw.id, raw.title, raw.unit);
  }

  static toPersistence(domain: WorkType): DBWorkType {
    return {
      id: domain.id,
      title: domain.title,
      unit: domain.unit,
    };
  }
}
