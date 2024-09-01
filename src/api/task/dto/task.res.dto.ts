import { UserResDto } from '@/api/user/dto/user.res.dto';
import { WrapperType } from '@/common/types/types';
import {
  BooleanFieldOptional,
  ClassField,
  DateField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TaskResDto {
  @UUIDField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose()
  slug: string;

  @StringFieldOptional()
  @Expose()
  content?: string;

  @BooleanFieldOptional({ default: false })
  @Expose()
  completed?: boolean;

  @ClassField(() => UserResDto)
  @Expose()
  user: WrapperType<UserResDto>;

  @StringField()
  @Expose()
  createdBy: string;

  @StringField()
  @Expose()
  updatedBy: string;

  @DateField()
  @Expose()
  createdAt: Date;

  @DateField()
  @Expose()
  updatedAt: Date;
}
