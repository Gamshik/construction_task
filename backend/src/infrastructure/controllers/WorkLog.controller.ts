import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateWorkLogService } from '@application/use-cases/CreateWorkLog.service';
import { GetWorkLogsService } from '@application/use-cases/GetWorkLogs.service';
import { DeleteWorkLogService } from '@application/use-cases/DeleteWorkLog.service';
import { UpdateWorkLogService } from '@application/use-cases/UpdateWorkLog.service';
import { CreateWorkLogDto } from './dto/CreateWorkLog.dto';
import { UpdateWorkLogDto } from './dto/UpdateWorkLog.dto';

@ApiTags('work-logs')
@Controller('work-logs')
export class WorkLogController {
  constructor(
    private readonly getWorkLogsService: GetWorkLogsService,
    private readonly createWorkLogService: CreateWorkLogService,
    private readonly updateWorkLogService: UpdateWorkLogService,
    private readonly deleteWorkLogService: DeleteWorkLogService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all work log entries' })
  @ApiResponse({ status: 200, description: 'List of work logs retrieved successfully.' })
  async getWorkLogs() {
    const list = await this.getWorkLogsService.execute();
    return list.map((wl) => ({
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
  }

  @Post()
  @ApiOperation({ summary: 'Create a new work log entry' })
  @ApiResponse({ status: 201, description: 'Work log created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
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

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing work log entry' })
  @ApiResponse({ status: 200, description: 'Work log updated successfully.' })
  @ApiResponse({ status: 404, description: 'Work log not found.' })
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a work log entry' })
  @ApiResponse({ status: 200, description: 'Work log deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Work log not found.' })
  async deleteWorkLog(@Param('id') id: string) {
    await this.deleteWorkLogService.execute(id);
    return { success: true };
  }
}
