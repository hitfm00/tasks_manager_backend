import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListTaskReqDto extends PageOptionsDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
