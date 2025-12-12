import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class SkuService extends BaseService<any> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  // ============================================================
  // ✔ Tentukan model prisma
  // ============================================================
  protected getModel() {
    return this.prismaService.sku;
  }

  // ============================================================
  // ✔ Pengaturan soft-delete (+ kolom deleted_at)
  // ============================================================
  protected getQueryOptions() {
    return {
      softDeleteField: 'deleted_at', // kolom soft delete
      searchableFields: ['name', 'code'], // optional untuk pagination
    };
  }
}
