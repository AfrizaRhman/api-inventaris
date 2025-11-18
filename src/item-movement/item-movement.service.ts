import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemMovementDto } from './dto/create-item-movement.dto';
import { UpdateItemMovementDto } from './dto/update-item-movement.dto';

@Injectable()
export class ItemMovementService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateItemMovementDto) {
    return this.prisma.db.itemMovement.create({
      data: {
        name: dto.name,
        phone_number: dto.phone_number,
        email: dto.email,
        necessity: dto.necessity,
        request_date: new Date(dto.request_date),
        created_by: dto.created_by,
        details: {
          create: dto.details.map((d) => ({
            sku_id: d.sku_id,
            sku_code: d.sku_code,
          })),
        },
      },
      include: { details: true },
    });
  }

  async findAll() {
    return this.prisma.db.itemMovement.findMany({
      include: { details: true },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.db.itemMovement.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            sku: {
              include: {
                item: true,
                warehouse: true,
              },
            },
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async update(id: number, dto: UpdateItemMovementDto) {
    return this.prisma.db.itemMovement.update({
      where: { id },
      data: {
        ...dto,
        updated_by: dto.created_by || undefined,
      },
    });
  }

  async remove(id: number) {
    await this.prisma.db.itemMovementDetail.deleteMany({
      where: { item_movement_id: id },
    });

    return this.prisma.db.itemMovement.delete({
      where: { id },
    });
  }
}
