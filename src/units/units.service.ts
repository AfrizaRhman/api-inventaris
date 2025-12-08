/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  SortDirection,
  PaginationDto,
} from '../common/dto/pagination.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService extends BaseService<any> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.db.unit;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'createdAt',
      defaultSortDirection: SortDirection.DESC,
      allowedSortFields: ['id', 'name', 'createdAt', 'updatedAt'],
      allowedFilterFields: ['id', 'name'],
      defaultSearchFields: ['name'],
      softDeleteField: 'deleted_at',
    };
  }

  // ===============================
  // CREATE
  // ===============================
  async createUnit(dto: CreateUnitDto) {
    return this.create({
      name: dto.name,
    });
  }

  // ===============================
  // GET LIST (Exclude Deleted)
  // ===============================
  async findAllUnitsPaginated(paginationDto: PaginationDto, where = {}) {
    return this.findAllPaginated(paginationDto, {
      ...where,
      deleted_at: null,
    });
  }

  // ===============================
  // GET BY ID (Exclude Deleted)
  // ===============================
  async findUnitById(id: string) {
    const unit = await this.findById(id);

    // Perbaikan: cek apakah unit sudah di-soft-delete
    if (!unit || unit.deleted_at !== null) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  // ===============================
  // UPDATE UNIT
  // ===============================
  async updateUnit(id: string, dto: UpdateUnitDto) {
    await this.findUnitById(id); // pastikan tidak update data yang sudah soft delete

    return this.update(id, {
      name: dto.name,
    });
  }

  // ===============================
  // SOFT DELETE (Perbaikan)
  // ===============================
  async softDeleteUnit(id: string) {
    // Pastikan tidak menghapus data yang sudah soft-delete
    await this.findUnitById(id);

    return this.update(id, {
      deleted_at: new Date(),
    });
  }

  // ===============================
  // HARD DELETE (Opsional)
  // ===============================
  async deleteUnitPermanently(id: string) {
    return this.permanentDelete(id);
  }
}
