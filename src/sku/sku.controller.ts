import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';
import { SkuService } from './sku.service';

@Controller('sku')
export class SkuController {
  constructor(private readonly skuService: SkuService) {}

  @Post()
  create(@Body() dto: CreateSkuDto) {
      return this.skuService.create(dto);
    }

  @Get()
  findAll() {
    return this.skuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skuService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSkuDto) {
      return this.skuService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skuService.remove(Number(id));
  }
}
