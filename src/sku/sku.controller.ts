import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SkuService } from './sku.service';

@Controller('sku')
export class SkuController {
  constructor(private readonly skuService: SkuService) {}

  @Post()
  create(@Body() data) {
    return this.skuService.create(data);
  }

  @Get()
  findAll() {
    return this.skuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skuService.findOne(String(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data) {
    return this.skuService.update(String(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skuService.remove(String(id));
  }
}
