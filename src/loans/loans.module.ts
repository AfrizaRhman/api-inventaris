import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LoansController],
  providers: [LoansService, PrismaService],
})
export class LoansModule {}
