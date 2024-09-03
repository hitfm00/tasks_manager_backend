import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth } from '@/decorators/http.decorators';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { CreateTaskReqDto } from './dto/create-task.req.dto';
import { ListTaskReqDto } from './dto/list-task.req.dto';
import { TaskResDto } from './dto/task.res.dto';
import { UpdateTaskReqDto } from './dto/update-task.req.dto';
import { TaskEntity } from './entities/task.entity';
import { TaskService } from './task.service';

@ApiTags('tasks')
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
    @Query() reqDto: ListTaskReqDto,
  ): Promise<OffsetPaginatedDto<TaskResDto>> {
    return this.taskService.findMany(reqDto);
  }

  @Patch(':id/toggle')
  @ApiAuth({
    type: TaskResDto,
    summary: 'Toggle task status',
  })
  @ApiParam({ name: 'id', type: 'String' })
  async toggle(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @CurrentUser() user: any,
  ): Promise<UpdateResult> {
    return this.taskService.toggle(id, user.id);
  }

  @Get(':idOrSlug')
  @ApiAuth({
    type: TaskResDto,
    summary: 'Get task by id or slug',
  })
  @ApiParam({ name: 'idOrSlug', type: 'String' })
  async findOne(@Param('idOrSlug') idOrSlug: string): Promise<TaskResDto> {
    return this.taskService.findByIdOrSlug(idOrSlug);
  }

  @Post()
  @ApiAuth({
    type: TaskResDto,
    summary: 'Create task',
  })
  async create(@Body() reqDto: CreateTaskReqDto, @CurrentUser() user: any) {
    const existingTask = await TaskEntity.findOneBy({ slug: reqDto.slug });

    if (existingTask) {
      throw new BadRequestException(
        'Slug already exists. Please choose a different slug.',
      );
    }

    return this.taskService.create(reqDto, user.id);
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
    return await this.taskService.update(id, reqDto, userId);
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
