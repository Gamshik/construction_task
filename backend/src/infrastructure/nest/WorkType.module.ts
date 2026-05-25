import { Module } from '@nestjs/common';
import { PrismaService } from '../repositories/Prisma.service';
import { PrismaWorkTypeRepository } from '../repositories/PrismaWorkType.repository';
import { GetWorkTypesService } from '@application/use-cases/GetWorkTypes.service';
import { WorkTypeController } from '../controllers/WorkType.controller';

/**
 * Модуль NestJS для справочника типов строительных работ.
 * Регистрирует контроллер, сервис получения типов работ и репозиторий, экспортируя их для других модулей.
 */
@Module({
  controllers: [WorkTypeController],
  providers: [
    PrismaService,
    // Связывание выходного порта репозитория типов работ с его Prisma-реализацией
    {
      provide: 'WorkTypeRepositoryPort',
      useClass: PrismaWorkTypeRepository,
    },
    GetWorkTypesService,
  ],
  exports: ['WorkTypeRepositoryPort', GetWorkTypesService], // Экспортируем репозиторий и сервис для импорта в WorkLogModule
})
export class WorkTypeModule {}

