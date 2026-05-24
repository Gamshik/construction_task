import { WorkType } from '@domain/WorkType.entity';

export interface WorkTypeRepositoryPort {
  findAll(): Promise<WorkType[]>;
  findById(id: string): Promise<WorkType | null>;
}
