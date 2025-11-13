import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  PaginationDto,
  SortDirection,
  ColumnFilterDto,
} from '../common/dto/pagination.dto';
import { CreateOdtwDto, UpdateOdtwDto } from './dto/odtw.dto';
import { Odtw } from '@prisma/client';
import { QueryBuilderService } from '../common/services/query-builder.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OdtwService extends BaseService<Odtw> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return (this.prismaService.db as any).odtw;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'created_at',
      defaultSortDirection: SortDirection.DESC,
      allowedSortFields: [
        'id',
        'odtw_code',
        'name',
        'ticket_price',
        'address',
        'village',
        'district',
        'city',
        'province',
        'email',
        'phone',
        'longitude',
        'bank_name',
        'account_name',
        'account_number',
        'latitude',
        'status',
        'created_at',
        'updated_at',
      ],
      allowedFilterFields: [
        'id',
        'odtw_code',
        'name',
        'ticket_price',
        'address',
        'village',
        'district',
        'city',
        'province',
        'email',
        'phone',
        'longitude',
        'latitude',
        'status',
        'bank_name',
        'account_name',
        'account_number',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
      defaultSearchFields: ['odtw_code', 'name', 'address', 'village', 'district', 'city', 'province'],
      softDeleteField: 'deleted_at',
    };
  }

  async createOdtw(data: CreateOdtwDto) {
    // Check for existing ODTW with the same email or name
    const existing = await (this.prismaService.db as any).odtw.findFirst({
      where: {
        OR: [{ email: data.email }, { name: data.name }],
      },
    });
    if (existing) {
      throw new ConflictException('Email or name already exists');
    }

    // Generate ODTW code if not provided
    if (!data.odtw_code) {
      data.odtw_code = Math.random().toString(36).substring(2, 5).toUpperCase();
    }

    return this.create(data);
  }

  async findAllOdtwsPaginated(paginationDto: PaginationDto) {
    const select = {
      id: true,
      odtw_code: true,
      name: true,
      ticket_price: true,
      address: true,
      village: true,
      district: true,
      city: true,
      province: true,
      phone: true,
      email: true,
      longitude: true,
      latitude: true,
      status: true,
      bank_name: true,
      account_name: true,
      account_number: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
    };
    
    return this.findAllPaginated(paginationDto, { deleted_at: null }, select);
  }

  async findOdtwById(id: string) {
    const odtw = await (this.prismaService.db as any).odtw.findUnique({
      where: { id },
    });
    if (!odtw) throw new NotFoundException('ODTW not found');
    return odtw;
  }

  async updateOdtw(id: string, data: UpdateOdtwDto) {
    const odtw = await (this.prismaService.db as any).odtw.findUnique({
      where: { id },
    });
    if (!odtw) throw new NotFoundException('ODTW not found');

    // Check for email/name conflicts if they're being updated
    if (data.email) {
      const conflictOdtw = await (this.prismaService.db as any).odtw.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (conflictOdtw) {
        throw new ConflictException('Email already taken');
      }
    }

    if (data.name) {
      const conflictOdtw = await (this.prismaService.db as any).odtw.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });

      if (conflictOdtw) {
        throw new ConflictException('Name already taken');
      }
    }

    return this.update(id, data);
  }

  async softDeleteOdtw(id: string, deleted_by?: string) {
    const odtw = await (this.prismaService.db as any).odtw.findUnique({
      where: { id },
    });
    if (!odtw) throw new NotFoundException('ODTW not found');

    return this.update(id, {
      deleted_at: Math.floor(Date.now() / 1000),
      deleted_by,
    });
  }

  async findAllWithDeleted(select: any) {
    return await (this.prismaService.db as any).odtw.findMany({ select });
  }

  async getOdtwsByFilter(filters: ColumnFilterDto[]): Promise<Odtw[]> {
    const options = this.getQueryOptions();
    const queryParams = QueryBuilderService.buildQueryParams(
      { filters } as PaginationDto,
      options,
    );
    return this.findAll(queryParams);
  }

  async setOdtwAdmin(odtwId: string, userId: string) {
    const odtw = await this.findOdtwById(odtwId);
    if (!odtw) throw new NotFoundException('ODTW not found');

    const user = await (this.prismaService.db as any).user.findUnique({
      where: { id: userId, deleted_at: null },
    });
    if (!user) throw new NotFoundException('User not found');

    const adminUser = await (this.prismaService.db as any).user.findFirst({
      where: { role: 'admin', odtw_id: odtwId, deleted_at: null },
    });
    if (adminUser) {
      await (this.prismaService.db as any).user.update({
        where: { id: adminUser.id },
        data: { odtw_id: null },
      });
    }

    await (this.prismaService.db as any).user.update({
      where: { id: userId },
      data: { odtw_id: odtwId },
    });

    return {
      message: 'User synchronized with ODTW successfully',
      odtw,
      user,
    };
  }
}
