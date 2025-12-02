import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  // ============================
  // CREATE LOAN + MULTIPLE DETAILS
  // ============================
  async create(dto: CreateLoanDto, adminName: string) {
    return this.prisma.loan.create({
      data: {
        name: dto.name,
        phone_number: dto.phone_number,
        email: dto.email,
        necessity: dto.necessity,
        note: dto.note,
        loan_date: dto.loan_date ? new Date(dto.loan_date) : null,
        created_by: adminName,
        updated_by: adminName,

        loan_details: {
          create: dto.details.map((d) => ({
            sku_id: d.sku_id,
            qty: d.qty,
            return_date: d.return_date ? new Date(d.return_date) : null,
            status: d.status ?? 'borrowed',
          })),
        },
      },
      include: { loan_details: true },
    });
  }

  // ============================
  // GET ALL
  // ============================
  findAll() {
    return this.prisma.loan.findMany({
      include: {
        loan_details: {
          include: { sku: true },
        },
      },
    });
  }

  // ============================
  // GET ONE
  // ============================
  findOne(id: number) {
    return this.prisma.loan.findUnique({
      where: { id },
      include: {
        loan_details: {
          include: { sku: true },
        },
      },
    });
  }

  // ============================
  // UPDATE LOAN + DETAILS
  // ============================
  async update(id: number, dto: UpdateLoanDto, adminName: string) {
    // Step 1: update parent loan
    const loan = await this.prisma.loan.update({
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
    });

    // Step 2: replace all loan_details (simple & clean)
    if (dto.details) {
      // hapus semua detail lama
      await this.prisma.db.loan_details.deleteMany({
        where: { loan_id: id },
      });

      // insert detail baru
      await this.prisma.db.loan_details.createMany({
        data: dto.details.map((d) => ({
          loan_id: id,
          sku_id: d.sku_id,
          qty: d.qty,
          return_date: d.return_date ? new Date(d.return_date) : null,
          status: d.status ?? 'borrowed',
        })),
      });
    }

    // Step 3: return loan lengkap
    return this.findOne(id);
  }

  // ============================
  // DELETE LOAN (+ cascade)
  // ============================
  remove(id: number) {
    return this.prisma.loan.delete({
      where: { id },
    });
  }
}
