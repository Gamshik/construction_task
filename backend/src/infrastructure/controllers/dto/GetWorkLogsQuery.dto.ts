import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO (объект передачи данных) для параметров запроса списка записей журнала.
 * Содержит параметры пагинации, полнотекстового поиска, фильтрации по датам и сортировки.
 */
export class GetWorkLogsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Номер запрашиваемой страницы' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 5, description: 'Количество записей на одной странице' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 'Иванов', description: 'Поисковая строка для фильтрации по исполнителю или названию работы' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '2026-05-24', description: 'Начальная дата диапазона (ГГГГ-ММ-ДД)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-25', description: 'Конечная дата диапазона (ГГГГ-ММ-ДД)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'], description: 'Направление сортировки записей по дате' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc';
}

