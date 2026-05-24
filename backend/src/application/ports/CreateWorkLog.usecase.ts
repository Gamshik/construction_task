import { WorkLog } from '@domain/WorkLog.entity';

export interface CreateWorkLogCommand {
  date: Date;
  workTypeId: string;
  volume: number;
  executorName: string;
}

export interface CreateWorkLogUseCase {
  execute(command: CreateWorkLogCommand): Promise<WorkLog>;
}
