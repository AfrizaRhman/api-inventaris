import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // CREATE
  @Post()
  create(@Body() data: CreateCategoryDto, @Req() req: any) {
    const userId = req.user?.id ?? 'system'; // sementara
    return this.categoryService.create(data, userId);
  }

  // GET ACTIVE ONLY (default list)
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  // GET ACTIVE + DELETED (untuk view restore)
  @Get('all')
  findAllWithDeleted() {
    return this.categoryService.findAllWithDeleted();
  }

  // DETAIL
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  // UPDATE
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id ?? 'system';
    return this.categoryService.update(id, data, userId);
  }

  // SOFT DELETE
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id ?? 'system';
    return this.categoryService.remove(id, userId);
  }

  // RESTORE
  @Put(':id/restore')
  restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id ?? 'system';
    return this.categoryService.restore(id, userId);
  }
}
