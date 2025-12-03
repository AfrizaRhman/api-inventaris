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
          Loans: true,
          LoanDetail: true,
          ItemMovement: true,
          ItemMovementDetail: true,
        },

        defaultConfig: {
          field: 'deleted_at',
          createValue: (deleted) => (deleted ? new Date() : null),
        },
      }),
    );
  }

  get db() {
    return this.extendedClient;
  }

  // === CAMELCASE SESUAI PRISMA ===
  get user() {
    return this.extendedClient.user;
  }
  get warehouse() {
    return this.extendedClient.warehouse;
  }
  get sku() {
    return this.extendedClient.sku;
  }
  get item() {
    return this.extendedClient.item;
  }
  get loans() {
    return this.extendedClient.loans;
  }
  get loanDetail() {
    return this.extendedClient.loanDetail; // FIXED
  }
  get itemMovement() {
    return this.extendedClient.itemMovement; // FIXED
  }
  get itemMovementDetail() {
    return this.extendedClient.itemMovementDetail; // FIXED
  }
  get category() {
    return this.extendedClient.categories;
  }

  async onModuleInit() {
    await this.baseClient.$connect();
  }

  async onModuleDestroy() {
    await this.baseClient.$disconnect();
  }
}
