import { WorkLog as DBWorkLog, WorkType as DBWorkType } from '@prisma/client';
import { WorkLog } from '@domain/WorkLog.entity';
import { WorkTypeMapper } from './WorkType.mapper';

type DBWorkLogWithRelations = DBWorkLog & {
  workType?: DBWorkType;
};

export class WorkLogMapper {
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
