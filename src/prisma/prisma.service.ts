/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    warehouse: any;
    [x: string]: any;
  private readonly baseClient: PrismaClient;
  private readonly extendedClient: any;

  // Semua custom accessor cukup ditulis sekali
  item: any;
  sku: any;
  loans: any;
  itemMovement: any;

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
          Loan: true,
          LoanDetail: true,
          ItemMovement: true,
          ItemMovementDetail: true,
        },        
        defaultConfig: {
          field: 'deleted_at',
          createValue: (deleted) => {
            if (deleted) return Math.floor(Date.now() / 1000);
            return null;
          },
        },
      }),
    );
  }

  get db() {
    return this.extendedClient;
  }

  async onModuleInit() {
    await this.baseClient.$connect();
  }

  async onModuleDestroy() {
    await this.baseClient.$disconnect();
  }
}
