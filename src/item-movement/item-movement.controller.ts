import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';

import { ItemMovementService } from './item-movement.service';
import { CreateItemMovementDto } from './dto/create-item-movement.dto';
import { UpdateItemMovementDto } from './dto/update-item-movement.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('item-movement')
export class ItemMovementController {
  constructor(private readonly service: ItemMovementService) {}

  /* =========================
     CREATE
  ========================== */
  @Post()
  create(@Body() dto: CreateItemMovementDto) {
    return this.service.createItemMovement(dto);
  }

  /* =========================
     GET ALL (WITH DETAILS)
     GET /item-movement
  ========================== */
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAllItemMovements(pagination);
  }

  /* =========================
     GET BY ID
     GET /item-movement/:id
  ========================== */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findItemMovementById(id);
  }

  /* =========================
     UPDATE
  ========================== */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemMovementDto) {
    return this.service.updateItemMovement(id, dto);
  }

  /* =========================
     SOFT DELETE
  ========================== */
  @Patch(':id/soft-delete')
  softDelete(@Param('id') id: string) {
    return this.service.softDeleteItemMovement(id);
  }

  /* =========================
     RESTORE
  ========================== */
  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.service.restoreItemMovement(id);
  }

  /* =========================
     HARD DELETE
  ========================== */
  @Delete(':id/hard-delete')
  hardDelete(@Param('id') id: string) {
    return this.service.hardDeleteItemMovement(id);
  }
}
