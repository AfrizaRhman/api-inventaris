import { Module } from '@nestjs/common';
import { SkuService } from './sku.service';
import { SkuController } from './sku.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SkuController],
  providers: [SkuService, PrismaService],
  exports: [SkuService],
})
export class SkuModule {}
