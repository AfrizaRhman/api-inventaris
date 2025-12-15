import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';

import { ItemMovementService } from './item-movement.service';
import { CreateItemMovementDto } from './dto/create-item-movement.dto';
import { UpdateItemMovementDto } from './dto/update-item-movement.dto';
import { PaginationDto, ColumnFilterDto } from '../common/dto/pagination.dto';

@Controller('item-movement')
export class ItemMovementController {
  constructor(private readonly service: ItemMovementService) {}

  @Post()
  create(@Body() dto: CreateItemMovementDto) {
    return this.service.createItemMovement(dto);
  }

  @Get()
  findAllPaginated(@Query() pagination: PaginationDto) {
    return this.service.findAllItemMovementsPaginated(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findItemMovementById(id);
  }

  @Post('filter')
  getFiltered(@Body() body: { filters: ColumnFilterDto[] }) {
    return this.service.getItemMovementsByFilter(body.filters);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemMovementDto) {
    return this.service.updateItemMovement(id, dto);
  }

  /* -----------------------------
     SOFT DELETE
  ------------------------------*/
  @Patch(':id/soft-delete')
  softDelete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  /* -----------------------------
     RESTORE
  ------------------------------*/
  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }

  /* -----------------------------
     HARD DELETE
  ------------------------------*/
  @Delete(':id/hard-delete')
  hardDelete(@Param('id') id: string) {
    return this.service.hardDelete(id);
  }
}
