import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetWorkTypesService } from '@application/use-cases/GetWorkTypes.service';

@ApiTags('work-types')
@Controller('work-types')
export class WorkTypeController {
  constructor(private readonly getWorkTypesService: GetWorkTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all work types dictionary' })
  @ApiResponse({ status: 200, description: 'List of work types retrieved successfully.' })
  async getWorkTypes() {
    const list = await this.getWorkTypesService.execute();
    return list.map((wt) => ({
      id: wt.id,
      title: wt.title,
      unit: wt.unit,
    }));
  }
}
