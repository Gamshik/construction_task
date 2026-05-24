import { Inject, Injectable } from '@nestjs/common';
import { WorkLog } from '@domain/WorkLog.entity';
import { WorkLogRepositoryPort } from '@application/ports/WorkLogRepository.interface';

@Injectable()
export class GetWorkLogsService {
  constructor(
    @Inject('WorkLogRepositoryPort')
    private readonly workLogRepository: WorkLogRepositoryPort,
  ) {}

  async execute(): Promise<WorkLog[]> {
    return this.workLogRepository.findAll();
  }
}
