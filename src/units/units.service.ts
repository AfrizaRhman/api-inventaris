import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  PaginationDto,
  SortDirection,
  QueryBuilderOptions,
} from '../common/dto/pagination.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService extends BaseService<any> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.db.unit;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      softDeleteField: 'deleted_at',
      defaultSortField: 'created_at',
      defaultSortDirection: SortDirection.DESC,
      allowedSortFields: ['name', 'created_at', 'updated_at'],
      allowedFilterFields: ['name'],
      defaultSearchFields: ['name'],
      defaultInclude: {},
    };
  }

  async createUnit(dto: CreateUnitDto) {
    return this.create({
      name: dto.name,
      deleted_at: null,
    });
  }

  async getUnits(query: any) {
    const pagination = new PaginationDto();

    pagination.page = query.page ? Number(query.page) : 1;
    pagination.limit = query.limit ? Number(query.limit) : 10;
    pagination.search = query.search || undefined;

    const where =
      query.deleted === 'true'
        ? { deleted_at: { not: null } }
        : { deleted_at: null };

    return this.findAllPaginated(pagination, where);
  }

  async findUnitById(id: string) {
    return this.findById(id);
  }

  async updateUnit(id: string, dto: UpdateUnitDto) {
    return this.update(id, {
      name: dto.name,
    });
  }

  async softDeleteUnit(id: string) {
    return this.softDelete(id);
  }

  async restoreUnit(id: string) {
    return this.restore(id);
  }

  async deleteUnitPermanently(id: string) {
    return this.hardDelete(id);
  }
}
