import { WorkLog } from '@domain/WorkLog.entity';

export interface WorkLogFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  sort?: 'asc' | 'desc';
}

export interface WorkLogRepositoryPort {
  findAll(options?: WorkLogFilterOptions): Promise<{ workLogs: WorkLog[]; total: number }>;
  findById(id: string): Promise<WorkLog | null>;
  create(workLog: WorkLog): Promise<WorkLog>;
  update(workLog: WorkLog): Promise<WorkLog>;
  delete(id: string): Promise<void>;
}
