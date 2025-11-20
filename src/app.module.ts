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
<<<<<<< HEAD
import { ItemsModule } from './items/items.module';
import { SkuModule } from './sku/sku.module';
import { WarehouseModule } from './warehouse/warehouse.module';

=======
import { CategoryModule } from './category/category.module';  // ⬅️ Tambahkan ini
>>>>>>> origin/category

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
<<<<<<< HEAD
    ItemsModule, 
    SkuModule,
    WarehouseModule, // <--- WAJIB ADA
=======
    CategoryModule, // ⬅️ Jangan lupa taruh di sini
>>>>>>> origin/category
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
