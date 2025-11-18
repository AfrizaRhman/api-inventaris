import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';

@Injectable()
export class SkuService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateSkuDto, userId?: string) {
    return this.prisma.sku.create({
      data: {
        ...data,
        created_by: userId || null,
      },
    });
  }

  findAll() {
    return this.prisma.sku.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        item: true,
        warehouse: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.sku.findUnique({
      where: { id },
      include: {
        item: true,
        warehouse: true,
      },
    });
  }

  update(id: string, data: UpdateSkuDto, userId?: string) {
    return this.prisma.sku.update({
      where: { id },
      data: {
        ...data,
        updated_by: userId || null,
        updated_at: Math.floor(Date.now() / 1000),
      },
    });
  }

  remove(id: string, userId?: string) {
    return this.prisma.sku.update({
      where: { id },
      data: {
        deleted_at: Math.floor(Date.now() / 1000),
        deleted_by: userId || null,
      },
    });
  }
}
