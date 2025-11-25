import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  // =======================================================
  // CREATE LOAN + DETAILS
  // =======================================================
  async create(dto: CreateLoanDto) {
    if (!dto.details || dto.details.length === 0) {
      throw new BadRequestException('Loan must have at least one detail');
    }

    const loan = await this.prisma.loans.create({
      data: {
        name: dto.name,
        phone_number: dto.phone_number,
        email: dto.email ?? null,
        necessity: dto.necessity ?? null,
        note: dto.note ?? null,
        loan_date: dto.loan_date ? new Date(dto.loan_date) : null,
      },
    });

    await this.prisma.loan_details.createMany({
      data: dto.details.map((d) => ({
        loan_id: loan.id,
        sku_id: d.sku_id,
        qty: d.qty,
        return_date: d.return_date ? new Date(d.return_date) : null,
        status: d.status ?? 'borrowed',
      })),
    });

    return this.findOne(loan.id);
  }

  // =======================================================
  // FIND ALL
  // =======================================================
  async findAll() {
    return await this.prisma.loans.findMany({
      orderBy: { loan_date: 'desc' },
      include: {
        loan_details: {
          include: { sku: true },
        },
      },
    });
  }

  // =======================================================
  // FIND ONE
  // =======================================================
  async findOne(id: string) {
    const loan = await this.prisma.loans.findUnique({
      where: { id },
      include: {
        loan_details: {
          include: { sku: true },
        },
      },
    });

    if (!loan) throw new NotFoundException('Loan not found');

    return loan;
  }

  // =======================================================
  // UPDATE LOAN + REPLACE DETAILS
  // =======================================================
  async update(id: string, dto: UpdateLoanDto) {
    // Check loan exist
    const existing = await this.prisma.loans.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Loan not found');

    // Update main loan record
    await this.prisma.loans.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        phone_number: dto.phone_number ?? existing.phone_number,
        email: dto.email ?? existing.email,
        necessity: dto.necessity ?? existing.necessity,
        note: dto.note ?? existing.note,
        loan_date: dto.loan_date ? new Date(dto.loan_date) : existing.loan_date,
      },
    });

    // If details included
    if (dto.details) {
      // delete existing detail rows
      await this.prisma.loan_details.deleteMany({ where: { loan_id: id } });

      if (dto.details.length > 0) {
        await this.prisma.loan_details.createMany({
          data: dto.details.map((d) => ({
            loan_id: id,
            sku_id: d.sku_id,
            qty: d.qty,
            return_date: d.return_date ? new Date(d.return_date) : null,
            status: d.status ?? 'borrowed',
          })),
        });
      }
    }

    return this.findOne(id);
  }

  // =======================================================
  // DELETE LOAN + DETAILS
  // =======================================================
  async remove(id: string) {
    await this.prisma.loan_details.deleteMany({
      where: { loan_id: id },
    });

    return await this.prisma.loans.delete({
      where: { id },
    });
  }
}
