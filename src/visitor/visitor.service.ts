import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  PaginationDto,
  SortDirection,
} from '../common/dto/pagination.dto';
import { CreateVisitorDto, UpdateVisitorDto } from './dto/visitor.dto';

@Injectable()
export class VisitorService extends BaseService<any> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.db.visitor;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'created_at',
      defaultSortDirection: SortDirection.DESC,
      allowedSortFields: [
        'id',
        'name',
        'phone',
        'created_at',
        'updated_at',
      ],
      allowedFilterFields: [
        'id',
        'name',
        'phone',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
      defaultSearchFields: ['name', 'phone'],
      softDeleteField: 'deleted_at',
    };
  }

  async createVisitor(data: CreateVisitorDto) {
    if (!data.name) throw new ConflictException('name is required');
    if (!data.phone) throw new ConflictException('phone is required');
    const existing = await this.prismaService.db.visitor.findFirst({
      where: { phone: data.phone },
    });
    if (existing) throw new ConflictException('Phone already exists');

    return this.create(data);
  }

  async findAllVisitorsPaginated(paginationDto: PaginationDto, additionalWhere: Record<string, any>) {
    return this.findAllPaginated(paginationDto, {...additionalWhere, deleted_at: null}, {
      id: true,
      name: true,
      phone: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
      created_by: true,
      updated_by: true,
      deleted_by: true,
    });
  }

  async findVisitorById(id: string) {
    return this.findById(id);
  }

  async updateVisitor(id: string, data: UpdateVisitorDto) {
    return this.update(id, data);
  }

  async softDeleteVisitor(id: string, deleted_by?: string) {
    return this.update(id, {
      deleted_at: Math.floor(Date.now() / 1000),
      deleted_by,
    });
  }
}