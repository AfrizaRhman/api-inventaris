import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // Create
  async create(data: CreateCategoryDto, userId: string) {
    return this.prisma.category.create({
      data: {
        ...data,
        created_by: userId,
      },
    });
  }

  // List (exclude soft deleted automatically)
  async findAll() {
    return this.prisma.db.categories.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // Detail
  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  // Update
  async update(id: string, data: UpdateCategoryDto, userId: string) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        updated_at: Math.floor(Date.now() / 1000),
        updated_by: userId,
      },
    });
  }

  // Soft delete (thanks to prisma-extension-soft-delete)
  async remove(id: string, userId: string) {
  return this.prisma.category.delete({
    where: { id },
    data: {
      deleted_by: userId,
      },
    });
  }
}
