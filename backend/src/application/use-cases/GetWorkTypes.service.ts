import { Inject, Injectable } from '@nestjs/common';
import { WorkType } from '@domain/WorkType.entity';
import { WorkTypeRepositoryPort } from '@application/ports/WorkTypeRepository.interface';

@Injectable()
export class GetWorkTypesService {
  constructor(
    @Inject('WorkTypeRepositoryPort')
    private readonly workTypeRepository: WorkTypeRepositoryPort,
  ) {}

  async execute(): Promise<WorkType[]> {
    return this.workTypeRepository.findAll();
  }
}
