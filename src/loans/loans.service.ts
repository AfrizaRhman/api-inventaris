import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLoanDto, adminName: string) {
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

        loan_details: {
          create: dto.details.map((d) => ({
            sku_id: d.sku_id,
            qty: d.qty,
            return_date: d.return_date ? new Date(d.return_date) : undefined,
            status: d.status ?? 'borrowed',
          })),
        },
      },
      include: { loan_details: true },
    });
  }

  findAll() {
    return this.prisma.loans.findMany({
      include: {
        loan_details: {
          include: {
            sku: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.loans.findUnique({
      where: { id },
      include: {
        loan_details: {
          include: {
            sku: true,
          },
        },
      },
    });
  }

  update(id: number, dto: UpdateLoanDto, adminName: string) {
    return this.prisma.loans.update({
      where: { id },
      data: {
        name: dto.name,
        phone_number: dto.phone_number,
        email: dto.email,
        necessity: dto.necessity,
        note: dto.note,
        loan_date: dto.loan_date ? new Date(dto.loan_date) : undefined,
        updated_by: adminName,
      },
      include: {
        loan_details: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.loans.delete({
      where: { id },
    });
  }
}
