import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // Create
  async create(data: CreateCategoryDto, userId: string) {
    return this.prisma.db.categories.create({
      data: {
        ...data,
        created_by: userId,
      },
    });
  }

  // List (filter agar tidak mengambil yang deleted)
  async findAll() {
    return this.prisma.db.categories.findMany({
      where: {
        deleted_at: null, // hanya yang tidak terhapus
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Detail
  async findOne(id: string) {
    const category = await this.prisma.db.categories.findFirst({
      where: {
        id,
        deleted_at: null, // tidak fetch yang terhapus
      },
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  // Update
  async update(id: string, data: UpdateCategoryDto, userId: string) {
    return this.prisma.db.categories.update({
      where: { id },
      data: {
        ...data,
        updated_by: userId,
      },
    });
  }

  // Soft Delete
  async remove(id: string, userId: string) {
    // pastikan data ada & belum terhapus
    const check = await this.prisma.db.categories.findFirst({
      where: { id, deleted_at: null },
    });

    if (!check) throw new NotFoundException('Category not found or already deleted');

    return this.prisma.db.categories.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: userId,
        status: 'inactive',
      },
    });
  }

  // Restore
  async restore(id: string, userId: string) {
    const check = await this.prisma.db.categories.findFirst({
      where: { id, deleted_at: { not: null } },
    });

    if (!check) throw new NotFoundException('Category not deleted');

    return this.prisma.db.categories.update({
      where: { id },
      data: {
        deleted_at: null,
        deleted_by: null,
        status: 'active',
        updated_by: userId,
      },
    });
  }
}
