import { Controller, Get, Post, Body, Param, Patch, Delete, Put } from '@nestjs/common';
import { SkuService } from './sku.service';
import { UpdateSkuDto } from './dto/update-sku.dto';

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
    return this.skuService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateSkuDto) {
  return this.skuService.update(id, data);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skuService.remove(Number(id));
  }
}
