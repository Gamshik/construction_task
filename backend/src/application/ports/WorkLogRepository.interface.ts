import { WorkLog } from '@domain/WorkLog.entity';

export interface WorkLogRepositoryPort {
  findAll(): Promise<WorkLog[]>;
  findById(id: string): Promise<WorkLog | null>;
  create(workLog: WorkLog): Promise<WorkLog>;
  update(workLog: WorkLog): Promise<WorkLog>;
  delete(id: string): Promise<void>;
}
