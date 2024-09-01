import { PostEntity } from '@/api/post/entities/post.entity';
import { TaskEntity } from '@/api/task/entities/task.entity';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(TaskEntity, (fake) => {
  const post = new PostEntity();

  post.title = fake.lorem.sentence();
  post.slug = fake.lorem.slug();
  post.content = fake.lorem.paragraphs();
  post.createdBy = SYSTEM_USER_ID;
  post.updatedBy = SYSTEM_USER_ID;

  return post;
});
