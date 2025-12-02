import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './users/user.module';
import { OdtwModule } from './odtw/odtw.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { VisitorModule } from './visitor/visitor.module';
import { ItemsModule } from './items/items.module';
import { SkuModule } from './sku/sku.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { UnitModule } from './units/units.module';
import { CategoryModule } from './category/category.module';

// 🔥 IMPORT INI
import { ItemMovementModule } from './item-movement/item-movement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UserModule,
    OdtwModule,
    KnowledgeModule,
    VisitorModule,
    ItemsModule,
    SkuModule,
    WarehouseModule,
    UnitModule,
    CategoryModule,

    // 🔥 DAFTARKAN MODULE NYA DISINI
    ItemMovementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
