import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

/**
 * DTO (объект передачи данных) для обновления записи в журнале работ.
 * Содержит правила валидации входящих полей.
 */
export class UpdateWorkLogDto {
  @ApiProperty({ example: '2026-05-24T12:00:00.000Z', description: 'Новая дата и время проведения строительных работ' })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: 'some-work-type-uuid', description: 'Новый идентификатор типа строительных работ (UUID)' })
  @IsString()
  @IsNotEmpty()
  workTypeId!: string;

  @ApiProperty({ example: 24.5, description: 'Новый объем выполненных работ (должен быть больше 0)' })
  @IsNumber()
  @Min(0.01, { message: 'Volume must be greater than 0' })
  volume!: number;

  @ApiProperty({ example: 'Иванов Иван Иванович', description: 'Новое ФИО или наименование исполнителя (прораба)' })
  @IsString()
  @IsNotEmpty()
  executorName!: string;
}

