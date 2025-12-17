import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  PaginationDto,
  SortDirection,
} from '../common/dto/pagination.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService extends BaseService<any> {
  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  /* ================= BASE CONFIG ================= */

  protected getModel() {
    return this.prisma.loans;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      softDeleteField: 'deleted_at',

      // ✅ FIELD YANG BENER ADA DI MODEL
      defaultSortField: 'loan_date',
      defaultSortDirection: SortDirection.DESC,

      allowedSortFields: [
        'loan_date',
        'name',
        'email',
        'phone_number',
      ],

      allowedFilterFields: [
        'name',
        'email',
        'phone_number',
        'loan_date',
      ],

      defaultSearchFields: [
        'name',
        'email',
        'phone_number',
      ],

      defaultInclude: {
        loan_details: {
          where: { deleted_at: null },
          include: { sku: true },
        },
      },

      allowedIncludes: ['loan_details'],
    };
  }

  /* ================= CREATE ================= */

  async createLoan(dto: CreateLoanDto) {
    return this.prisma.loans.create({
      data: {
        name: dto.name,
        phone_number: dto.phone_number,
        email: dto.email,
        necessity: dto.necessity,
        note: dto.note,
        loan_date: dto.loan_date ? new Date(dto.loan_date) : undefined,

        loan_details: dto.details?.length
          ? {
              create: dto.details.map((d) => ({
                sku_id: d.sku_id,
                qty: d.qty,
                return_date: d.return_date
                  ? new Date(d.return_date)
                  : null,
                status: d.status ?? 'borrowed',
              })),
            }
          : undefined,
      },
      include: {
        loan_details: {
          where: { deleted_at: null },
          include: { sku: true },
        },
      },
    });
  }

  /* ================= FIND ALL ================= */

  async findAllLoans(pagination: PaginationDto) {
    return this.findAllPaginated(
      pagination,
      {}, // additional where
      {
        loan_details: {
          where: { deleted_at: null },
          include: { sku: true },
        },
      },
    );
  }

  /* ================= FIND ONE ================= */

  async findLoanById(id: string) {
    const loan = await this.findById(id, {
      loan_details: {
        where: { deleted_at: null },
        include: { sku: true },
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  /* ================= UPDATE ================= */

  async updateLoan(id: string, dto: UpdateLoanDto) {
    return super.update(id, {
      name: dto.name,
      phone_number: dto.phone_number,
      email: dto.email,
      necessity: dto.necessity,
      note: dto.note,
      loan_date: dto.loan_date ? new Date(dto.loan_date) : undefined,
    });
  }

  /* ================= DELETE ================= */

  softDeleteLoan(id: string) {
    return super.softDelete(id);
  }

  restoreLoan(id: string) {
    return super.restore(id);
  }

  hardDeleteLoan(id: string) {
    return super.hardDelete(id);
  }
}
