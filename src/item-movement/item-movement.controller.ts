import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ItemMovementService } from './item-movement.service';
import { CreateItemMovementDto } from './dto/create-item-movement.dto';
import { UpdateItemMovementDto } from './dto/update-item-movement.dto';

@Controller('item-movement')
export class ItemMovementController {
  constructor(private readonly service: ItemMovementService) {}

  @Post()
  create(@Body() dto: CreateItemMovementDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemMovementDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
