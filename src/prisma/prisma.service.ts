/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly baseClient: PrismaClient;
  private readonly extendedClient: any;

  constructor() {
    this.baseClient = new PrismaClient();

    // Soft Delete Extension
    this.extendedClient = this.baseClient.$extends(
      createSoftDeleteExtension({
        models: {
          User: true,
          Odtw: true,
          Warehouse: true,
          Unit: true,
          Categories: true,
          Item: true,
          Sku: true,
          Loan: true,
          LoanDetail: true,
          ItemMovement: true,
          ItemMovementDetail: true,
        },
        defaultConfig: {
          field: 'deleted_at',
          createValue: (deleted) => (deleted ? new Date() : null),
          // Jika mau deleted_at bisa dipakai di where, aktifkan ini:
          // allowToUseFieldInQuery: true,
        },
      }) as unknown as any,
    );
  }

  // Akses seluruh Prisma Client
  get db() {  
    return this.extendedClient;
  }

  // Model accessors yg benar (harus mengikuti Prisma Client)
  get warehouse() {
    return this.extendedClient.warehouse;
  }

  get sku() {
    return this.extendedClient.sku;
  }

  get item() {
    return this.extendedClient.item;
  }

  get loan() {
    return this.extendedClient.loan; // ✔ benar, bukan loans
  }

  get loanDetail() {
    return this.extendedClient.loanDetail;
  }

  get itemMovement() {
    return this.extendedClient.itemMovement; // ✔ benar, bukan item_Movement
  }

  get itemMovementDetail() {
    return this.extendedClient.itemMovementDetail;
  }

  get categories() {
    return this.extendedClient.categories;
  }

  async onModuleInit() {
    await this.baseClient.$connect();
  }

  async onModuleDestroy() {
    await this.baseClient.$disconnect();
  }
}
