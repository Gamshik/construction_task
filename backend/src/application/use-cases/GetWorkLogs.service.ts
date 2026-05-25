import { Inject, Injectable } from '@nestjs/common';
import { WorkLog } from '@domain/WorkLog.entity';
import { WorkLogRepositoryPort, WorkLogFilterOptions } from '@application/ports/WorkLogRepository.interface';

@Injectable()
export class GetWorkLogsService {
  constructor(
    @Inject('WorkLogRepositoryPort')
    private readonly workLogRepository: WorkLogRepositoryPort,
  ) {}

  async execute(options?: WorkLogFilterOptions): Promise<{ workLogs: WorkLog[]; total: number }> {
    return this.workLogRepository.findAll(options);
  }
}
