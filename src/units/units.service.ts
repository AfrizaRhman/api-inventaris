import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { SortDirection, QueryBuilderOptions } from '../common/dto/pagination.dto';

@Injectable()
export class UnitService extends BaseService<any> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  /**
   * Model yang digunakan service ini
   */
  protected getModel() {
    return this.prismaService.db.unit;
  }

  /**
   * Opsi Query Builder agar cocok dengan BaseService
   */
  protected getQueryOptions(): QueryBuilderOptions {
    return {
      softDeleteField: 'deleted_at',
      defaultSortField: 'created_at',
      defaultSortDirection: SortDirection.DESC, // ✔ gunakan enum, bukan string
      allowedSortFields: ['name', 'created_at', 'updated_at'],
      allowedFilterFields: ['name'],
      defaultSearchFields: ['name'],
      defaultInclude: {},
    };
  }

  /**
   * CREATE Unit
   */
  async createUnit(dto: CreateUnitDto) {
    return this.create({
      name: dto.name,
      deleted_at: null,
    });
  }

  /**
   * GET Units (pagination + filtering)
   */
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

  /**
   * Find by ID (tidak termasuk soft deleted)
   */
  async findUnitById(id: string) {
    const unit = await this.findById(id);

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found.`);
    }

    return unit;
  }

  /**
   * Find by ID termasuk yang deleted
   */
  async findUnitIncludingDeleted(id: string) {
    const unit = await this.getModel().findUnique({ where: { id } });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found.`);
    }

    return unit;
  }

  /**
   * Soft Delete
   */
  async softDeleteUnit(id: string) {
    return this.softDelete(id);
  }

  /**
   * Restore Soft Deleted
   */
  async restoreUnit(id: string) {
    const unit = await this.getModel().findUnique({ where: { id } });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found.`);
    }

    if (unit.deleted_at === null) {
      throw new NotFoundException(`Unit with ID ${id} is not deleted.`);
    }

    return this.restore(id);
  }

  /**
   * Permanent Delete
   */
  async deleteUnitPermanently(id: string) {
    await this.findUnitIncludingDeleted(id);

    return await this.getModel().delete({
      where: { id },
    });
  }

  /**
   * UPDATE
   */
  async updateUnit(id: string, dto: UpdateUnitDto) {
    return this.update(id, {
      name: dto.name,
    });
  }
}
