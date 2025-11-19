import { Module } from '@nestjs/common';
import { QueryBuilderService } from './services/query-builder.service';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [QueryBuilderService],
  exports: [QueryBuilderService, StorageModule],
})
export class CommonModule {}
