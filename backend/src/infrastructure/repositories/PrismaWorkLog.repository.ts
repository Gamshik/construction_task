import { Injectable } from '@nestjs/common';
import { WorkLogRepositoryPort, WorkLogFilterOptions } from '@application/ports/WorkLogRepository.interface';
import { WorkLog } from '@domain/WorkLog.entity';
import { PrismaService } from './Prisma.service';
import { WorkLogMapper } from './mappers/WorkLog.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaWorkLogRepository implements WorkLogRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: WorkLogFilterOptions): Promise<{ workLogs: WorkLog[]; total: number }> {
    const { page, limit, search, startDate, endDate, sort } = options || {};
    
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    const where: Prisma.WorkLogWhereInput = {};

    if (search && search.trim() !== '') {
      where.OR = [
        { executorName: { contains: search, mode: 'insensitive' } },
        { workType: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    const [raw, total] = await Promise.all([
      this.prisma.workLog.findMany({
        where,
        include: { workType: true },
        orderBy: [
          { date: sort ?? 'desc' },
          { id: 'asc' },
        ],
        skip,
        take,
      }),
      this.prisma.workLog.count({ where }),
    ]);

    return {
      workLogs: raw.map(WorkLogMapper.toDomain),
      total,
    };
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
