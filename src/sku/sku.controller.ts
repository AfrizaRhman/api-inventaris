import { Controller, Get, Post, Body, Patch, Param, Delete, Injectable } from '@nestjs/common';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';

@Injectable()
class SkuService {
  create(dto: CreateSkuDto) {
    // simple stub implementation until a proper service is created
    return dto;
  }

  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  update(id: string, dto: UpdateSkuDto) {
    return { id, ...dto };
  }

  remove(id: string) {
    return { deleted: true, id };
  }
}

@Controller('skus')
export class SkuController {
  constructor(private readonly service: SkuService) {}

  @Post()
  create(@Body() dto: CreateSkuDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSkuDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
