import { Module } from '@nestjs/common';
import { ItemMovementService } from './item-movement.service';
import { ItemMovementController } from './item-movement.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ItemMovementController],
  providers: [ItemMovementService, PrismaService],
})
export class ItemMovementModule {}
