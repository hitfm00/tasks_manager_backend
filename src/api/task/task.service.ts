import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { paginate } from '@/utils/offset-pagination';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import assert from 'assert';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { isUUID } from 'class-validator';
import { CreateTaskReqDto } from './dto/create-task.req.dto';
import { ListTaskReqDto } from './dto/list-task.req.dto';
import { TaskResDto } from './dto/task.res.dto';
import { UpdateTaskReqDto } from './dto/update-task.req.dto';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findMany(
    reqDto: ListTaskReqDto,
  ): Promise<OffsetPaginatedDto<TaskResDto>> {
    const cachePrefix = 'tasks_all';
    const cacheKey = `${cachePrefix}_${JSON.stringify(reqDto)}`;
    const cachedResult =
      await this.cacheManager.get<OffsetPaginatedDto<TaskResDto>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const query = TaskEntity.createQueryBuilder('task').orderBy(
      'task.createdAt',
      'DESC',
    );

    if (reqDto.completed !== undefined) {
      query.andWhere('task.completed = :completed', {
        completed: reqDto.completed,
      });
    }

    const [tasks, metaDto] = await paginate<TaskEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    const result = new OffsetPaginatedDto(
      plainToInstance(TaskResDto, tasks),
      metaDto,
    );

    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  async invalidateCacheForTasksList() {
    const cacheKeys = await this.cacheManager.store.keys();
    const tasksKeys = cacheKeys.filter((key) => key.startsWith('tasks_all'));

    await Promise.all(tasksKeys.map((key) => this.cacheManager.del(key)));
  }

  async findByIdOrSlug(idOrSlug: string | Uuid): Promise<TaskResDto> {
    const cacheKey = `task_${idOrSlug}`;
    let taskDto = await this.cacheManager.get<TaskResDto>(cacheKey);

    if (!taskDto) {
      let task: TaskEntity | undefined;

      if (isUUID(idOrSlug)) {
        task = await TaskEntity.findOneBy({ id: idOrSlug as Uuid });
      } else {
        task = await TaskEntity.findOneBy({ slug: idOrSlug });
      }

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      taskDto = plainToInstance(TaskResDto, task);
      await this.cacheManager.set(cacheKey, taskDto);
    }

    return taskDto;
  }

  async create(reqDto: CreateTaskReqDto, userId: Uuid) {
    const task = TaskEntity.create({
      ...reqDto,
      createdBy: userId,
      updatedBy: userId,
    });
    const savedTask = await task.save();

    await this.invalidateCacheForTasksList();

    return savedTask;
  }

  async update(id: Uuid, reqDto: UpdateTaskReqDto, userId: Uuid) {
    assert(id, 'id is required');

    const updateResult = await TaskEntity.update(id, {
      ...reqDto,
      updatedBy: userId,
    });

    if (updateResult.affected > 0) {
      await this.cacheManager.del('tasks_all');
      await this.cacheManager.del(`task_${id}`);
    }
    await this.invalidateCacheForTasksList();

    return updateResult;
  }

  async delete(id: Uuid) {
    assert(id, 'id is required');

    const deleteResult = await TaskEntity.delete(id);

    if (deleteResult.affected > 0) {
      await this.invalidateCacheForTasksList();
      await this.cacheManager.del(`task_${id}`);
    }

    return deleteResult;
  }

  // Toggle completed status
  async toggle(id: Uuid, userId: Uuid) {
    const task = await TaskEntity.findOneBy({
      id,
    });
    const updateResult = await TaskEntity.update(id, {
      ...task,
      completed: !task.completed,
      updatedBy: userId,
    });

    if (updateResult.affected > 0) {
      await this.invalidateCacheForTasksList();
      await this.cacheManager.del(`task_${id}`);
    }

    return updateResult;
  }
}
