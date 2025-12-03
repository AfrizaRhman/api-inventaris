import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  SortDirection,
  PaginationDto,
} from '../common/dto/pagination.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService extends BaseService<any> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.db.item;
  }

  protected getQueryOptions(): QueryBuilderOptions {
  return {
    defaultSortField: 'created_at', // FIX
    defaultSortDirection: SortDirection.DESC,
    allowedSortFields: ['id', 'name', 'price', 'stock', 'created_at', 'updated_at'], // FIX
    allowedFilterFields: ['id', 'name', 'price', 'stock', 'category_id', 'unit_id'],
    defaultSearchFields: ['name', 'supplier', 'code'],
    softDeleteField: 'deleted_at',
  };
}


  private readonly itemInclude = {
    unit: true,
    category: true,
  };

  private async ensureExists(model: 'unit' | 'categories', id?: string) {
    if (!id) return;

    const record = await (this.prismaService.db as any)[model].findUnique({
      where: { id },
    });

    if (!record) {
      throw new BadRequestException(`${model} with ID '${id}' does not exist.`);
    }
  }

  // CREATE
  async createItem(dto: CreateItemDto) {
    await this.ensureExists('unit', dto.unit_id);
    await this.ensureExists('categories', dto.category_id);

    return this.create(
      {
        name: dto.name,
        supplier: dto.supplier ?? null,
        price: dto.price ?? null,
        stock: dto.stock,
        description: dto.description ?? null,
        code: dto.code ?? null,
        image: dto.image ?? null,
        unit_id: dto.unit_id,
        category_id: dto.category_id,
        created_at: new Date(),   // ✅ tambahkan ini
      },
      this.itemInclude
    );    
  }

  // PAGINATION
  async findAllItemsPaginated(paginationDto: PaginationDto, where = {}) {
    return this.findAllPaginated(
      paginationDto,
      { ...where, deleted_at: null },
      this.itemInclude
    );
  }

  // FIND ONE
  async findItemById(id: string) {
    const item = await this.findById(id, this.itemInclude);

    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);

    return item;
  }

  // UPDATE
  async updateItem(id: string, dto: UpdateItemDto) {
    await this.findItemById(id);

    if (dto.unit_id) await this.ensureExists('unit', dto.unit_id);
    if (dto.category_id) await this.ensureExists('categories', dto.category_id);

    return this.update(
      id,
      {
        name: dto.name ?? undefined,
        supplier: dto.supplier ?? undefined,
        price: dto.price ?? undefined,
        stock: dto.stock ?? undefined,
        description: dto.description ?? undefined,
        code: dto.code ?? undefined,
        image: dto.image ?? undefined,
        unit_id: dto.unit_id ?? undefined,
        category_id: dto.category_id ?? undefined,
      },
      this.itemInclude
    );
  }

  // SOFT DELETE
  async softDeleteItem(id: string) {
    return this.update(id, {
      deleted_at: Math.floor(Date.now() / 1000),
    });
  }

  // HARD DELETE
  async deleteItemPermanently(id: string) {
    return this.permanentDelete(id);
  }
}
