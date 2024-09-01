import {
  BooleanFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';

export class CreateTaskReqDto {
  @StringField()
  readonly title: string;

  @StringField()
  readonly slug: string;

  @StringFieldOptional()
  readonly content?: string;

  @BooleanFieldOptional({ default: false })
  readonly completed?: boolean;
}
