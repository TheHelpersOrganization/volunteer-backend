import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import { stringToBooleanTransform } from 'src/common/transformers';

export enum ChatQueryInclude {
  Message = 'message',
}

export enum ChatQuerySort {
  CreatedAtAsc = 'createdAt',
  CreatedAtDesc = '-createdAt',
  UpdatedAtAsc = 'updatedAt',
  UpdatedAtDesc = '-updatedAt',
}

export const chatQueryIncludes = Object.values(ChatQueryInclude);

export class ChatQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(chatQueryIncludes.length)
  @IsEnum(ChatQueryInclude, { each: true })
  @Transform(({ value }) => value.split(','))
  include?: ChatQueryInclude[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  messageLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  messageOffset?: number;
}

export class ChatsQueryDto extends ChatQueryDto {
  // @IsOptional()
  // @IsInt()
  // @Transform(stringToIntTransform)
  // accountId?: number;

  // @IsOptional()
  // @IsInt()
  // @Transform(stringToIntTransform)
  // participantId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isBlocked?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(stringToBooleanTransform)
  isGroup?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  name?: string;

  @IsOptional()
  @IsEnum(ChatQuerySort)
  sort?: ChatQuerySort;
}

export class ChatMessagesQueryDto extends PaginationQueryDto {}
