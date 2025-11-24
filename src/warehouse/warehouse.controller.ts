import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(dto);
  }

  @Get()
  findAllPaginated(@Query() paginationDto: PaginationDto) {
    return this.warehouseService.findAllWarehousesPaginated(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseService.findWarehouseById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseService.updateWarehouse(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseService.softDeleteWarehouse(id);
  }
}
