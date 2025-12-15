import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import { QueryBuilderOptions } from '../common/dto/pagination.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService extends BaseService<any> {
  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  /* ============================================================
        BASE-SERVICE CONFIG
    ============================================================ */
  protected getModel() {
    return this.prisma.loans;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      softDeleteField: 'deleted_at',
    };
  }

  /* ============================================================
        CREATE LOAN (custom)
    ============================================================ */
  async createLoan(dto: CreateLoanDto, adminName: string) {
    return this.prisma.loans.create({
      data: {
        name: dto.name,
        phone_number: dto.phone_number,
        email: dto.email,
        necessity: dto.necessity,
        note: dto.note,
        loan_date: dto.loan_date ? new Date(dto.loan_date) : undefined,
        created_by: adminName,
        updated_by: adminName,

        loan_details:
          dto.details && dto.details.length > 0
            ? {
                create: dto.details.map((d) => ({
                  sku_id: d.sku_id,
                  qty: d.qty,
                  return_date: d.return_date
                    ? new Date(d.return_date)
                    : undefined,
                  status: d.status ?? 'borrowed',
                })),
              }
            : undefined,
      },
      include: {
        loan_details: {
          include: { sku: true },
        },
      },
    });
  }

  /* ============================================================
        FIND ALL PAGINATED (custom)
    ============================================================ */
  async findAllLoans(pagination: any) {
    return this.findAllPaginated(
      pagination,
      {},
      {
        id: true,
        name: true,
        phone_number: true,
        email: true,
        necessity: true,
        note: true,
        loan_date: true,
        created_by: true,
        updated_by: true,
        deleted_at: true,
        loan_details: { include: { sku: true } },
      }
    );
  }

  /* ============================================================
        FIND ONE (custom)
    ============================================================ */
  async findLoanById(id: string) {
    const loan = await this.findById(id, {
      id: true,
      name: true,
      phone_number: true,
      email: true,
      necessity: true,
      note: true,
      loan_date: true,
      created_by: true,
      updated_by: true,
      deleted_at: true,
      loan_details: { include: { sku: true } },
    });

    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  /* ============================================================
        UPDATE LOAN (custom)
    ============================================================ */
  async updateLoan(id: string, dto: UpdateLoanDto, adminName: string) {
    return super.update(id, {
      name: dto.name,
      phone_number: dto.phone_number,
      email: dto.email,
      necessity: dto.necessity,
      note: dto.note,
      loan_date: dto.loan_date ? new Date(dto.loan_date) : undefined,
      updated_by: adminName,
    });
  }

  /* ============================================================
        DELETE HANDLING (inherit BaseService)
    ============================================================ */
  async softDeleteLoan(id: string) {
    return super.softDelete(id);
  }

  async restoreLoan(id: string) {
    return super.restore(id);
  }

  async hardDeleteLoan(id: string) {
    return super.hardDelete(id);
  }
}
