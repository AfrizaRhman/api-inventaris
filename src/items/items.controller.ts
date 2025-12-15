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

    /** CREATE */
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    create(@Body() dto: CreateItemDto) {
      return this.itemsService.createItem(dto);
    }

    /** PAGINATION */
    @Get()
    findAll(@Query() pagination: PaginationDto) {
      return this.itemsService.findAllItemsPaginated(pagination);
    }

    /** FIND ONE */
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.itemsService.findItemById(id);
    }

    /** UPDATE */
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
      return this.itemsService.updateItem(id, dto);
    }

    /** SOFT DELETE */
    @Patch(':id')
    async softDelete(@Param('id') id: string) {
      const item = await this.itemsService.softDeleteItem(id);
      return {
        message: 'Item soft-deleted successfully',
        item,
      };
    }

    /** RESTORE */
    @Put(':id/restore')
    async restore(@Param('id') id: string) {
      const item = await this.itemsService.restoreItem(id);
      return {
        message: 'Item restored successfully',
        item,
      };
    }

    /** HARD DELETE */
    @Delete(':id/permanent')
    async hardDelete(@Param('id') id: string) {
      await this.itemsService.deleteItemPermanently(id);
      return {
        message: 'Item permanently deleted',
      };
    } 
  }
