import { Controller, Get, Post, Body, Put, Param, Delete, Req } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto, @Req() req) {
    return this.categoryService.create(dto, req.user?.id);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() req) {
    return this.categoryService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.categoryService.remove(id, req.user?.id);
  }

  @Put(':id/restore')
  restore(@Param('id') id: string, @Req() req) {
    return this.categoryService.restore(id, req.user?.id);
  }
}
