import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // CREATE
  async create(data: CreateCategoryDto, userId: string) {
    return this.prisma.category.create({
      data: {
        ...data,
        created_by: userId,
      },
    });
  }

  // LIST – Only Active (not soft deleted)
  async findAll() {
    return this.prisma.category.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  // LIST ALL including soft deleted (for admin restore view)
  async findAllWithDeleted() {
    return this.prisma.category.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // DETAIL
  async findOne(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  // UPDATE
  async update(id: string, data: UpdateCategoryDto, userId: string) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }

  // SOFT DELETE
  async remove(id: string, userId: string) {
    return this.prisma.category.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: userId,
      },
    });
  }

  // RESTORE
  async restore(id: string, userId: string) {
    return this.prisma.category.update({
      where: { id },
      data: {
        deleted_at: null,
        deleted_by: null,
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }
}
