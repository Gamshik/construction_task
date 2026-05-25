import { Module } from '@nestjs/common';
import { WorkTypeModule } from './WorkType.module';
import { WorkLogModule } from './WorkLog.module';

/**
 * Корневой модуль приложения NestJS.
 * Объединяет все остальные функциональные модули системы.
 */
@Module({
  imports: [WorkTypeModule, WorkLogModule],
})
export class AppModule {}

