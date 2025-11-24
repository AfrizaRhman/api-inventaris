import { Controller, Get, Post, Body, Param, Put, Delete, Query, } from '@nestjs/common';
import { SkuService } from './sku.service';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('sku')
export class SkuController {
  constructor(private readonly skuService: SkuService) {}

  @Post()
  create(@Body() dto: CreateSkuDto) {
    return this.skuService.createSku(dto);
  }

  @Get()
  findAllPaginated(@Query() paginationDto: PaginationDto) {
    return this.skuService.findAllSkusPaginated(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skuService.findSkuById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSkuDto) {
    return this.skuService.updateSku(id, dto);
  }

  // soft delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skuService.softDeleteSku(id);
  }
}
