import { Module } from '@nestjs/common';
import { PrismaService } from '../repositories/Prisma.service';
import { PrismaWorkLogRepository } from '../repositories/PrismaWorkLog.repository';
import { CreateWorkLogService } from '@application/use-cases/CreateWorkLog.service';
import { GetWorkLogsService } from '@application/use-cases/GetWorkLogs.service';
import { UpdateWorkLogService } from '@application/use-cases/UpdateWorkLog.service';
import { DeleteWorkLogService } from '@application/use-cases/DeleteWorkLog.service';
import { WorkLogController } from '../controllers/WorkLog.controller';
import { WorkTypeModule } from './WorkType.module';

/**
 * Функциональный модуль NestJS для управления журналом производства строительных работ.
 * Собирает вместе контроллер, юзкейсы и внедряет зависимость репозитория по интерфейсному порту.
 */
@Module({
  imports: [WorkTypeModule], // Требуется для проверки существования типов работ при добавлении записей
  controllers: [WorkLogController],
  providers: [
    PrismaService,
    // Связывание выходного порта репозитория с его конкретной инфраструктурной реализацией на Prisma
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

