import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  private readonly itemInclude = {
    unit: true,
    category: true,
    warehouse: true,
    createdBy: true,
    updatedBy: true,
    sku: {
      include: {
        movementDetail: true,
        loanDetails: true,
      },
    },
    movementDetails: true,
  };

  // FIXED — memastikan nama model sesuai Prisma Client
  private async ensureExists(
    model: 'unit' | 'category' | 'warehouse' | 'user',
    id: string,
  ) {
    if (!id) return;

    const record = await (this.prisma as any)[model].findUnique({
      where: { id },
    });

    if (!record) {
      throw new BadRequestException(`${model} with ID '${id}' does not exist.`);
    }
  }

  // CREATE ITEM
  async create(dto: CreateItemDto) {
    await this.ensureExists('unit', dto.unit_id);
    await this.ensureExists('category', dto.category_id);
    if (dto.warehouse_id) await this.ensureExists('warehouse', dto.warehouse_id);
    if (dto.created_by) await this.ensureExists('user', dto.created_by);

    try {
      return await this.prisma.items.create({
        data: {
          name: dto.name,
          supplier: dto.supplier ?? null,
          price: dto.price ?? null,
          stock: dto.stock,
          description: dto.description ?? null,
          code: dto.code ?? null,
          image: dto.image ?? null,

          unit_id: dto.unit_id,
          category_id: dto.category_id,
          warehouse_id: dto.warehouse_id ?? null,
          created_by: dto.created_by ?? null,
        },
        include: this.itemInclude,
      });
    } catch (err) {
      console.error('PRISMA CREATE ITEM ERROR:', err);

      if (err.code === 'P2003') {
        throw new BadRequestException(
          'Foreign key constraint failed. Make sure all related IDs exist.',
        );
      }

      throw new InternalServerErrorException('Failed to create item');
    }
  }

  // FIND ALL
  async findAll() {
    return this.prisma.items.findMany({
      include: this.itemInclude,
      orderBy: { name: 'asc' },
    });
  }

  // FIND ONE
  async findOne(id: string) {
    const item = await this.prisma.items.findUnique({
      where: { id },
      include: this.itemInclude,
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  // UPDATE
  async update(id: string, dto: UpdateItemDto) {
    await this.findOne(id);

    if (dto.unit_id) await this.ensureExists('unit', dto.unit_id);
    if (dto.category_id) await this.ensureExists('category', dto.category_id);
    if (dto.warehouse_id) await this.ensureExists('warehouse', dto.warehouse_id);
    if (dto.updated_by) await this.ensureExists('user', dto.updated_by);

    try {
      return await this.prisma.items.update({
        where: { id },
        data: {
          name: dto.name ?? undefined,
          supplier: dto.supplier ?? undefined,
          price: dto.price ?? undefined,
          stock: dto.stock ?? undefined,
          description: dto.description ?? undefined,
          code: dto.code ?? undefined,
          image: dto.image ?? undefined,

          unit_id: dto.unit_id ?? undefined,
          category_id: dto.category_id ?? undefined,
          warehouse_id: dto.warehouse_id ?? undefined,

          updated_by: dto.updated_by ?? undefined,
        },
        include: this.itemInclude,
      });
    } catch (err) {
      console.error('PRISMA UPDATE ITEM ERROR:', err);
      throw new InternalServerErrorException('Failed to update item');
    }
  }

  // DELETE
  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.items.delete({
        where: { id },
      });
    } catch (err) {
      console.error('PRISMA DELETE ITEM ERROR:', err);
      throw new InternalServerErrorException('Failed to delete item');
    }
  }
}
