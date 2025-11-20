import { Module } from '@nestjs/common';
import { UnitController } from './units.controller';
import { UnitService } from './units.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule {}
