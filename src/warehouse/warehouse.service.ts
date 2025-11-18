import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.warehouse.findMany();
  }

  findOne(id: string) {
    return this.prisma.warehouse.findUnique({
      where: { id },
    });
  }

  update(id: string, dto: UpdateWarehouseDto) {
    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.warehouse.delete({
      where: { id },
    });
  }
}
