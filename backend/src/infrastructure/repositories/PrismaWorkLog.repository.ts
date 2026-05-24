import { Injectable } from '@nestjs/common';
import { WorkLogRepositoryPort } from '@application/ports/WorkLogRepository.interface';
import { WorkLog } from '@domain/WorkLog.entity';
import { PrismaService } from './Prisma.service';
import { WorkLogMapper } from './mappers/WorkLog.mapper';

@Injectable()
export class PrismaWorkLogRepository implements WorkLogRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<WorkLog[]> {
    const raw = await this.prisma.workLog.findMany({
      include: { workType: true },
      orderBy: { date: 'desc' },
    });
    return raw.map(WorkLogMapper.toDomain);
  }

  async findById(id: string): Promise<WorkLog | null> {
    const raw = await this.prisma.workLog.findUnique({
      where: { id },
      include: { workType: true },
    });
    return raw ? WorkLogMapper.toDomain(raw) : null;
  }

  async create(workLog: WorkLog): Promise<WorkLog> {
    const persistenceData = WorkLogMapper.toPersistence(workLog);
    const raw = await this.prisma.workLog.create({
      data: persistenceData,
      include: { workType: true },
    });
    return WorkLogMapper.toDomain(raw);
  }

  async update(workLog: WorkLog): Promise<WorkLog> {
    const persistenceData = WorkLogMapper.toPersistence(workLog);
    const raw = await this.prisma.workLog.update({
      where: { id: workLog.id },
      data: persistenceData,
      include: { workType: true },
    });
    return WorkLogMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workLog.delete({
      where: { id },
    });
  }
}
