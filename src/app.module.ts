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
<<<<<<< HEAD
import { LoansModule } from './loans/loans.module';
=======
import { UnitModule } from './units/units.module';
>>>>>>> efa5cf7dd1ce627c42450c0a9c26f69f868c7969


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
<<<<<<< HEAD
    WarehouseModule,
    LoansModule,
=======
    WarehouseModule, // <--- WAJIB ADA
    UnitModule,

>>>>>>> efa5cf7dd1ce627c42450c0a9c26f69f868c7969
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
