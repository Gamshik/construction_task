import { Module } from '@nestjs/common';
import { WorkTypeModule } from './WorkType.module';
import { WorkLogModule } from './WorkLog.module';

@Module({
  imports: [WorkTypeModule, WorkLogModule],
})
export class AppModule {}
