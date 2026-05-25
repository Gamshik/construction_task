import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateWorkLogService } from '@application/use-cases/CreateWorkLog.service';
import { GetWorkLogsService } from '@application/use-cases/GetWorkLogs.service';
import { DeleteWorkLogService } from '@application/use-cases/DeleteWorkLog.service';
import { UpdateWorkLogService } from '@application/use-cases/UpdateWorkLog.service';
import { CreateWorkLogDto } from './dto/CreateWorkLog.dto';
import { UpdateWorkLogDto } from './dto/UpdateWorkLog.dto';
import { GetWorkLogsQueryDto } from './dto/GetWorkLogsQuery.dto';

/**
 * Контроллер для обработки HTTP-запросов журнала производства строительных работ.
 * Маршрут: `/api/work-logs`
 */
@ApiTags('work-logs')
@Controller('work-logs')
export class WorkLogController {
  constructor(
    private readonly getWorkLogsService: GetWorkLogsService,
    private readonly createWorkLogService: CreateWorkLogService,
    private readonly updateWorkLogService: UpdateWorkLogService,
    private readonly deleteWorkLogService: DeleteWorkLogService,
  ) {}

  /**
   * Получает список записей журнала с поддержкой пагинации, поиска и фильтрации по датам.
   * 
   * @param query - Параметры строки запроса (пагинация, даты, поиск)
   * @returns Список отформатированных записей (или объект с данными и метаданными при пагинации)
   */
  @Get()
  @ApiOperation({ summary: 'Получить список всех записей в журнале производства работ' })
  @ApiResponse({ status: 200, description: 'Список записей успешно получен.' })
  async getWorkLogs(@Query() query: GetWorkLogsQueryDto) {
    const page = query.page;
    const limit = query.limit;
    
    // Парсинг дат со временем начала и конца дня для корректной фильтрации в БД
    let parsedStartDate: Date | undefined;
    if (query.startDate) {
      parsedStartDate = new Date(query.startDate);
      parsedStartDate.setHours(0, 0, 0, 0); // Начало запрашиваемого дня
    }

    let parsedEndDate: Date | undefined;
    if (query.endDate) {
      parsedEndDate = new Date(query.endDate);
      parsedEndDate.setHours(23, 59, 59, 999); // Конец запрашиваемого дня
    }

    // Вызов юзкейса получения записей
    const { workLogs, total } = await this.getWorkLogsService.execute({
      page,
      limit,
      search: query.search,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      sort: query.sort,
    });
    
    // Форматирование доменных сущностей во внешний JSON-формат
    const mappedData = workLogs.map((wl) => ({
      id: wl.id,
      date: wl.date.toISOString(),
      workTypeId: wl.workTypeId,
      workType: wl.workType
        ? {
            id: wl.workType.id,
            title: wl.workType.title,
            unit: wl.workType.unit,
          }
        : null,
      volume: wl.volume,
      executorName: wl.executorName,
    }));

    // Если переданы параметры пагинации, возвращаем объект с данными и метаинформацией
    if (page !== undefined && limit !== undefined) {
      return {
        data: mappedData,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    return mappedData;
  }

  /**
   * Создает новую запись в журнале.
   * 
   * @param dto - Входящие данные новой записи
   * @returns Созданная и отформатированная запись
   */
  @Post()
  @ApiOperation({ summary: 'Создать новую запись в журнале производства работ' })
  @ApiResponse({ status: 201, description: 'Запись успешно создана.' })
  @ApiResponse({ status: 400, description: 'Некорректные входящие данные.' })
  async createWorkLog(@Body() dto: CreateWorkLogDto) {
    const created = await this.createWorkLogService.execute({
      date: new Date(dto.date),
      workTypeId: dto.workTypeId,
      volume: dto.volume,
      executorName: dto.executorName,
    });
    return {
      id: created.id,
      date: created.date.toISOString(),
      workTypeId: created.workTypeId,
      workType: created.workType
        ? {
            id: created.workType.id,
            title: created.workType.title,
            unit: created.workType.unit,
          }
        : null,
      volume: created.volume,
      executorName: created.executorName,
    };
  }

  /**
   * Обновляет параметры существующей записи в журнале.
   * 
   * @param id - Идентификатор обновляемой записи
   * @param dto - Новые параметры записи
   * @returns Обновленная и отформатированная запись
   */
  @Put(':id')
  @ApiOperation({ summary: 'Обновить существующую запись в журнале работ' })
  @ApiResponse({ status: 200, description: 'Запись успешно обновлена.' })
  @ApiResponse({ status: 404, description: 'Запись не найдена.' })
  async updateWorkLog(@Param('id') id: string, @Body() dto: UpdateWorkLogDto) {
    const updated = await this.updateWorkLogService.execute({
      id,
      date: new Date(dto.date),
      workTypeId: dto.workTypeId,
      volume: dto.volume,
      executorName: dto.executorName,
    });
    return {
      id: updated.id,
      date: updated.date.toISOString(),
      workTypeId: updated.workTypeId,
      workType: updated.workType
        ? {
            id: updated.workType.id,
            title: updated.workType.title,
            unit: updated.workType.unit,
          }
        : null,
      volume: updated.volume,
      executorName: updated.executorName,
    };
  }

  /**
   * Удаляет запись из журнала по её ID.
   * 
   * @param id - Идентификатор удаляемой записи
   * @returns Объект со статусом успеха операции
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить запись из журнала производства работ' })
  @ApiResponse({ status: 200, description: 'Запись успешно удалена.' })
  @ApiResponse({ status: 404, description: 'Запись не найдена.' })
  async deleteWorkLog(@Param('id') id: string) {
    await this.deleteWorkLogService.execute(id);
    return { success: true };
  }
}

