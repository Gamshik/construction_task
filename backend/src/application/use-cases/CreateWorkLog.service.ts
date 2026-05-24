import { Inject, Injectable } from '@nestjs/common';
import { WorkLog } from '@domain/WorkLog.entity';
import { CreateWorkLogCommand, CreateWorkLogUseCase } from '@application/ports/CreateWorkLog.usecase';
import { WorkLogRepositoryPort } from '@application/ports/WorkLogRepository.interface';
import { WorkTypeRepositoryPort } from '@application/ports/WorkTypeRepository.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateWorkLogService implements CreateWorkLogUseCase {
  constructor(
    @Inject('WorkLogRepositoryPort')
    private readonly workLogRepository: WorkLogRepositoryPort,
    @Inject('WorkTypeRepositoryPort')
    private readonly workTypeRepository: WorkTypeRepositoryPort,
  ) {}

  async execute(command: CreateWorkLogCommand): Promise<WorkLog> {
    const workType = await this.workTypeRepository.findById(command.workTypeId);
    if (!workType) {
      throw new Error(`WorkType with ID ${command.workTypeId} not found`);
    }

    const id = randomUUID();
    const workLog = new WorkLog(
      id,
      command.date,
      command.workTypeId,
      workType,
      command.volume,
      command.executorName,
    );

    return this.workLogRepository.create(workLog);
  }
}
