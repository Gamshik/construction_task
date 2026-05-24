import { Module } from '@nestjs/common';
import { PrismaService } from '../repositories/Prisma.service';
import { PrismaWorkLogRepository } from '../repositories/PrismaWorkLog.repository';
import { CreateWorkLogService } from '@application/use-cases/CreateWorkLog.service';
import { GetWorkLogsService } from '@application/use-cases/GetWorkLogs.service';
import { UpdateWorkLogService } from '@application/use-cases/UpdateWorkLog.service';
import { DeleteWorkLogService } from '@application/use-cases/DeleteWorkLog.service';
import { WorkLogController } from '../controllers/WorkLog.controller';
import { WorkTypeModule } from './WorkType.module';

@Module({
  imports: [WorkTypeModule],
  controllers: [WorkLogController],
  providers: [
    PrismaService,
    {
      provide: 'WorkLogRepositoryPort',
      useClass: PrismaWorkLogRepository,
    },
    CreateWorkLogService,
    GetWorkLogsService,
    UpdateWorkLogService,
    DeleteWorkLogService,
  ],
})
export class WorkLogModule {}
