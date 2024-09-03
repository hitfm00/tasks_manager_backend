import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [CacheModule.register()],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
