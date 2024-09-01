import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { paginate } from '@/utils/offset-pagination';
import { Injectable } from '@nestjs/common';
import assert from 'assert';
import { plainToInstance } from 'class-transformer';
import { ListUserReqDto } from '../user/dto/list-user.req.dto';
import { CreateTaskReqDto } from './dto/create-task.req.dto';
import { TaskResDto } from './dto/task.res.dto';
import { UpdateTaskReqDto } from './dto/update-task.req.dto';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor() {}

  async findMany(
    reqDto: ListUserReqDto,
  ): Promise<OffsetPaginatedDto<TaskResDto>> {
    const query = TaskEntity.createQueryBuilder('task').orderBy(
      'task.createdAt',
      'DESC',
    );
    const [tasks, metaDto] = await paginate<TaskEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });

    return new OffsetPaginatedDto(plainToInstance(TaskResDto, tasks), metaDto);
  }

  async findOne(id: Uuid): Promise<TaskResDto> {
    assert(id, 'id is required');
    const task = await TaskEntity.findOneByOrFail({ id });

    return task.toDto(TaskResDto);
  }

  create(reqDto: CreateTaskReqDto) {
    const task = TaskEntity.create(reqDto);
    return task.save();
  }

  update(id: Uuid, reqDto: UpdateTaskReqDto) {
    assert(id, 'id is required');
    const task = TaskEntity.update(id, reqDto);
    return task;
  }

  delete(id: Uuid) {
    assert(id, 'id is required');

    const task = TaskEntity.delete(id);
    return task;
  }
}
