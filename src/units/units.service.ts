/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  SortDirection,
  PaginationDto,
} from '../common/dto/pagination.dto';
import { CreateUnitDto } from './dto/create-unit.dto';

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
      defaultSortField: 'id', // FIXED
      defaultSortDirection: SortDirection.ASC,
      allowedSortFields: ['id', 'name', 'deleted_at'], // FIXED
      allowedFilterFields: ['id', 'name'],
      defaultSearchFields: ['name'],
      softDeleteField: 'deleted_at',
    };
  }

  async createUnit(dto: CreateUnitDto) {
    return this.create({
      name: dto.name,
    });
  }

  async findAllUnitsPaginated(paginationDto: PaginationDto, where = {}) {
    return this.findAllPaginated(
      paginationDto,
      { ...where, deleted_at: null }, // fetch only NOT deleted record
    );
  }

  async findUnitById(id: string) {
    const unit = await this.findById(id);

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async softDeleteUnit(id: string) {
    // ensure exists
    await this.findUnitById(id);

    // FIXED → deleted_at as Date
    return this.update(id, {
      deleted_at: new Date(),
    });
  }

  async deleteUnitPermanently(id: string) {
    return this.permanentDelete(id);
  }
}
