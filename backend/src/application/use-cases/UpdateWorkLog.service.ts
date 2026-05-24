import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkLog } from '@domain/WorkLog.entity';
import { WorkLogRepositoryPort } from '@application/ports/WorkLogRepository.interface';
import { WorkTypeRepositoryPort } from '@application/ports/WorkTypeRepository.interface';

export interface UpdateWorkLogCommand {
  id: string;
  date: Date;
  workTypeId: string;
  volume: number;
  executorName: string;
}

@Injectable()
export class UpdateWorkLogService {
  constructor(
    @Inject('WorkLogRepositoryPort')
    private readonly workLogRepository: WorkLogRepositoryPort,
    @Inject('WorkTypeRepositoryPort')
    private readonly workTypeRepository: WorkTypeRepositoryPort,
  ) {}

  async execute(command: UpdateWorkLogCommand): Promise<WorkLog> {
    const existing = await this.workLogRepository.findById(command.id);
    if (!existing) {
      throw new NotFoundException(`WorkLog with ID ${command.id} not found`);
    }

    const workType = await this.workTypeRepository.findById(command.workTypeId);
    if (!workType) {
      throw new NotFoundException(`WorkType with ID ${command.workTypeId} not found`);
    }

    const updatedWorkLog = new WorkLog(
      command.id,
      command.date,
      command.workTypeId,
      workType,
      command.volume,
      command.executorName,
    );

    return this.workLogRepository.update(updatedWorkLog);
  }
}
