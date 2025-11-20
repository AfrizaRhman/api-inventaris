/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

<<<<<<< HEAD
=======
/**
 * PrismaService with soft delete functionality using prisma-extension-soft-delete
 *
 * This service extends the Prisma client with soft delete capabilities:
 * - Automatically handles soft delete for User model using 'deleted_at' field
 * - Uses epoch timestamps (integer) for Laravel-style soft delete
 * - Provides methods for soft delete, restore, and querying
 *
 * Extension Features:
 * - findMany/findUnique automatically exclude soft deleted records
 * - softDelete() sets deleted_at timestamp without actually deleting
 * - restore() clears deleted_at field to restore records
 * - findManyWithDeleted() includes soft deleted records
 * - findManyDeleted() returns only soft deleted records
 */

>>>>>>> origin/category
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
<<<<<<< HEAD
          Categories: true,
          Item: true,
          Sku: true,
          Loan: true,
          LoanDetail: true,
          Item_Movement: true,
          ItemMovementDetail: true,
        },        
        defaultConfig: {
          field: 'deleted_at',
          createValue: (deleted) => {
            if (deleted) return Math.floor(Date.now() / 1000);
=======
          Category: true,
          Item: true,
          Sku: true,
        },
        defaultConfig: {
          field: 'deleted_at',
          createValue: (deleted) => {
            if (deleted) return Math.floor(Date.now() / 1000); // Epoch timestamp
>>>>>>> origin/category
            return null;
          },
        },
      }),
    );
  }

  get db() {
<<<<<<< HEAD
  return this.extendedClient;
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
    return this.extendedClient.loan;
  }

  get itemMovement() {
    return this.extendedClient.item_Movement;
=======
    return this.extendedClient;
>>>>>>> origin/category
  }

  async onModuleInit() {
    await this.baseClient.$connect();
  }

  async onModuleDestroy() {
    await this.baseClient.$disconnect();
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/category
