import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseService } from 'src/common/services/base.service';
import { QueryBuilderOptions } from 'src/common/dto/pagination.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService extends BaseService<any> {
  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  // Model Prisma yang digunakan
  protected getModel() {
    return this.prisma.warehouse;
  }

  // Pengaturan soft delete
  protected getQueryOptions(): QueryBuilderOptions {
    return {
      softDeleteField: 'deleted_at', // Prisma column
    };
  }

  /* ============================================================
      CUSTOM CRUD
  ============================================================ */

  create(dto: CreateWarehouseDto) {
    return super.create(dto);
  }

  findAll() {
    return super.findAll();
  }

  findAllWithDeleted() {
    return super.findAllWithDeleted();
  }

  findDeleted() {
    return super.findDeleted();
  }

  findById(id: string) {
    return super.findById(id);
  }

  update(id: string, dto: UpdateWarehouseDto) {
    return super.update(id, dto);
  }

  softDelete(id: string) {
    return super.softDelete(id);
  }

  restore(id: string) {
    return super.restore(id);
  }

  hardDelete(id: string) {
    return super.hardDelete(id);
  }
}
