import { Injectable } from '@nestjs/common';
import { WorkTypeRepositoryPort } from '@application/ports/WorkTypeRepository.interface';
import { WorkType } from '@domain/WorkType.entity';
import { PrismaService } from './Prisma.service';
import { WorkTypeMapper } from './mappers/WorkType.mapper';

@Injectable()
export class PrismaWorkTypeRepository implements WorkTypeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<WorkType[]> {
    const raw = await this.prisma.workType.findMany({
      orderBy: { title: 'asc' },
    });
    return raw.map(WorkTypeMapper.toDomain);
  }

  async findById(id: string): Promise<WorkType | null> {
    const raw = await this.prisma.workType.findUnique({
      where: { id },
    });
    return raw ? WorkTypeMapper.toDomain(raw) : null;
  }
}
