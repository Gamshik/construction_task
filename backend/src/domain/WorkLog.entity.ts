import { WorkType } from './WorkType.entity';

export class WorkLog {
  constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly workTypeId: string,
    public readonly workType: WorkType | null,
    public readonly volume: number,
    public readonly executorName: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    if (!id) {
      throw new Error('WorkLog id is required');
    }
    if (!date || isNaN(date.getTime())) {
      throw new Error('WorkLog date must be a valid Date');
    }
    if (!workTypeId) {
      throw new Error('WorkLog workTypeId is required');
    }
    if (volume <= 0) {
      throw new Error('WorkLog volume must be greater than zero');
    }
    if (!executorName || executorName.trim().length === 0) {
      throw new Error('WorkLog executorName cannot be empty');
    }
  }
}
