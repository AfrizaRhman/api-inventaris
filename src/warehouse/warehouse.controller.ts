import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Put,
  Delete,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // CREATE
  @Post()
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.create(dto);
  }

  // GET ALL (yang belum soft delete)
  @Get()
  findAll() {
    return this.warehouseService.findAll();
  }

  // GET ALL (termasuk yang sudah soft delete)
  @Get('with-deleted')
  findAllWithDeleted() {
    return this.warehouseService.findAllWithDeleted();
  }

  // GET deleted only
  @Get('deleted')
  findDeleted() {
    return this.warehouseService.findDeleted();
  }

  // FIND ONE (hanya yang belum soft delete)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseService.findById(id);
  }

  // UPDATE
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, dto);
  }

  // SOFT DELETE (PATCH)
  @Patch(':id/soft-delete')
  softDelete(@Param('id') id: string) {
    return this.warehouseService.softDelete(id);
  }

  // RESTORE (PUT)
  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.warehouseService.restore(id);
  }

  // HARD DELETE (DELETE)
  @Delete(':id/hard-delete')
  hardDelete(@Param('id') id: string) {
    return this.warehouseService.hardDelete(id);
  }
}
