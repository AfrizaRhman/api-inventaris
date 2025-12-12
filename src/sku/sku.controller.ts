import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Put,
} from '@nestjs/common';
import { SkuService } from './sku.service';

@Controller('sku')
export class SkuController {
  constructor(private readonly skuService: SkuService) {}

  @Post()
  create(@Body() data: any) {
    return this.skuService.create(data);
  }

  @Get()
  findAll() {
    return this.skuService.findAll();
  }

  @Get('with-deleted')
  findAllWithDeleted() {
    return this.skuService.findAllWithDeleted();
  }

  @Get('deleted')
  findDeleted() {
    return this.skuService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skuService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.skuService.update(id, data);
  }

  // ============================================
  // ✔ SOFT DELETE 
  // PATCH /sku/:id/soft-delete
  // ============================================
  @Patch(':id')
  softDelete(@Param('id') id: string) {
    return this.skuService.softDelete(id);
  }

  // ============================================
  // ✔ RESTORE 
  // PUT /sku/:id/restore
  // ============================================
  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.skuService.restore(id);
  }

  // ============================================
  // ✔ HARD DELETE 
  // DELETE /sku/:id/hard-delete
  // ============================================
  @Delete(':id/hard-delete')
  hardDelete(@Param('id') id: string) {
    return this.skuService.hardDelete(id);
  }
}
