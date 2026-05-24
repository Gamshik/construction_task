import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkLogRepositoryPort } from '@application/ports/WorkLogRepository.interface';

@Injectable()
export class DeleteWorkLogService {
  constructor(
    @Inject('WorkLogRepositoryPort')
    private readonly workLogRepository: WorkLogRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.workLogRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`WorkLog with ID ${id} not found`);
    }
    await this.workLogRepository.delete(id);
  }
}
