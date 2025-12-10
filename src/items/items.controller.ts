import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateItemDto) {
    return this.itemsService.createItem(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.itemsService.findAllItemsPaginated(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findItemById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.updateItem(id, dto);
  }

  // SOFT DELETE
  @Patch(':id')
  async remove(@Param('id') id: string) {
    const item = await this.itemsService.softDeleteItem(id);
    return {
      message: item.deleted_at
        ? 'Item soft-deleted successfully'
        : 'Item already soft-deleted',
      item,
    };
  }

  // HARD DELETE (permanent)
  @Delete(':id/permanent')
  hardDelete(@Param('id') id: string) {
    return this.itemsService.deleteItemPermanently(id);
  }
}
