import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 5000,
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
