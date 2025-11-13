import { Module } from '@nestjs/common';
import { OdtwController } from './odtw.controller';
import { OdtwService } from './odtw.service';

@Module({
  controllers: [OdtwController],
  providers: [OdtwService],
  exports: [OdtwService],
})
export class OdtwModule {}
