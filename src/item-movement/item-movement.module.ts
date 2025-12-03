import { Module } from '@nestjs/common';
import { ItemMovementService } from './item-movement.service';
import { ItemMovementController } from './item-movement.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],    // <-- WAJIB
  controllers: [ItemMovementController],
  providers: [ItemMovementService],
})
export class ItemMovementModule {}
