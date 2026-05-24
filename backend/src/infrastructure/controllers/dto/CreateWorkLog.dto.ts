import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateWorkLogDto {
  @ApiProperty({ example: '2026-05-24T12:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: 'some-work-type-uuid' })
  @IsString()
  @IsNotEmpty()
  workTypeId!: string;

  @ApiProperty({ example: 24.5 })
  @IsNumber()
  @Min(0.01, { message: 'Volume must be greater than 0' })
  volume!: number;

  @ApiProperty({ example: 'Иванов Иван Иванович' })
  @IsString()
  @IsNotEmpty()
  executorName!: string;
}
