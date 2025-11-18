import { Injectable, NotFoundException } from '@nestjs/common';
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

  // CREATE
  async create(dto: CreateItemDto) {
    return this.prisma.db.item.create({
      data: {
        name: dto.name,
        supplier: dto.supplier,
        price: dto.price,
        stock: dto.stock,
        description: dto.description,
        code: dto.code,
        image: dto.image,

        unit: { connect: { id: dto.unit_id } },
        category: { connect: { id: dto.category_id } },

        warehouse: dto.warehouse_id
          ? { connect: { id: dto.warehouse_id } }
          : undefined,

        createdBy: dto.created_by
          ? { connect: { id: dto.created_by } }
          : undefined,
      },
      include: this.itemInclude,
    });
  }

  // FIND ALL
  async findAll() {
    return this.prisma.db.item.findMany({
      include: this.itemInclude,
      orderBy: { name: 'asc' },
    });
  }

  // FIND ONE
  async findOne(id: string) {
    const item = await this.prisma.db.item.findUnique({
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

    return this.prisma.db.item.update({
      where: { id },
      data: {
        name: dto.name,
        supplier: dto.supplier,
        price: dto.price,
        stock: dto.stock,
        description: dto.description,
        code: dto.code,
        image: dto.image,

        unit: dto.unit_id ? { connect: { id: dto.unit_id } } : undefined,
        category: dto.category_id
          ? { connect: { id: dto.category_id } }
          : undefined,

        warehouse: dto.warehouse_id
          ? { connect: { id: dto.warehouse_id } }
          : undefined,

        updatedBy: dto.updated_by
          ? { connect: { id: dto.updated_by } }
          : undefined,
      },
      include: this.itemInclude,
    });
  }

  // DELETE
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.db.item.delete({
      where: { id },
    });
  }
}
