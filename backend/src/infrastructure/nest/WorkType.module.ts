import { Module } from '@nestjs/common';
import { PrismaService } from '../repositories/Prisma.service';
import { PrismaWorkTypeRepository } from '../repositories/PrismaWorkType.repository';
import { GetWorkTypesService } from '@application/use-cases/GetWorkTypes.service';
import { WorkTypeController } from '../controllers/WorkType.controller';

@Module({
  controllers: [WorkTypeController],
  providers: [
    PrismaService,
    {
      provide: 'WorkTypeRepositoryPort',
      useClass: PrismaWorkTypeRepository,
    },
    GetWorkTypesService,
  ],
  exports: ['WorkTypeRepositoryPort', GetWorkTypesService],
})
export class WorkTypeModule {}
