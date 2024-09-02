import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ListUserReqDto } from '../user/dto/list-user.req.dto';
import { CreateTaskReqDto } from './dto/create-task.req.dto';
import { TaskResDto } from './dto/task.res.dto';
import { UpdateTaskReqDto } from './dto/update-task.req.dto';
import { TaskService } from './task.service';

@ApiTags('tasks')
@UseInterceptors(CacheInterceptor)
@Controller({
  path: 'tasks',
  version: '1',
})
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiAuth({
    type: TaskResDto,
    summary: 'Get tasks',
    isPaginated: true,
  })
  async findMany(
    @Query() reqDto: ListUserReqDto,
  ): Promise<OffsetPaginatedDto<TaskResDto>> {
    return this.taskService.findMany(reqDto);
  }

  @Get(':id')
  @ApiAuth({
    type: TaskResDto,
    summary: 'Get task by id',
  })
  @ApiParam({ name: 'id', type: 'String' })
  async findOne(@Param('id', ParseUUIDPipe) id: Uuid) {
    return this.taskService.findOne(id);
  }

  @Post()
  @ApiAuth({
    type: TaskResDto,
    summary: 'Create task',
  })
  async create(
    @Body() reqDto: CreateTaskReqDto,
    @CurrentUser('id') userId: Uuid,
  ) {
    return this.taskService.create(reqDto, userId);
  }

  @Patch(':id')
  @ApiAuth({
    type: TaskResDto,
    summary: 'Update task by id',
  })
  @ApiParam({ name: 'id', type: 'String' })
  async update(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Body() reqDto: UpdateTaskReqDto,
    @CurrentUser('id') userId: Uuid,
  ) {
    return this.taskService.update(id, reqDto, userId);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete task',
  })
  @ApiParam({ name: 'id', type: 'String' })
  async delete(@Param('id', ParseUUIDPipe) id: Uuid) {
    return this.taskService.delete(id);
  }
}
