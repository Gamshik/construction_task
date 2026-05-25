import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetWorkTypesService } from '@application/use-cases/GetWorkTypes.service';

/**
 * Контроллер для обработки HTTP-запросов к справочнику видов строительных работ.
 * Маршрут: `/api/work-types`
 */
@ApiTags('work-types')
@Controller('work-types')
export class WorkTypeController {
  constructor(private readonly getWorkTypesService: GetWorkTypesService) {}

  /**
   * Возвращает полный список видов работ для заполнения справочников на клиенте.
   * 
   * @returns Список видов работ (id, title, unit)
   */
  @Get()
  @ApiOperation({ summary: 'Получить справочник всех типов строительных работ' })
  @ApiResponse({ status: 200, description: 'Справочник типов работ успешно получен.' })
  async getWorkTypes() {
    const list = await this.getWorkTypesService.execute();
    return list.map((wt) => ({
      id: wt.id,
      title: wt.title,
      unit: wt.unit,
    }));
  }
}

