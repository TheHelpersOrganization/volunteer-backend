import { Expose } from 'class-transformer';

export class FileOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  internalName: string;

  @Expose()
  mimetype: string;
}
