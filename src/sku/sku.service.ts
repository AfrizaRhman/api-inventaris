import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkuService {
  constructor(private prisma: PrismaService) {}

  create(data) {
    return this.prisma.sku.create({
      data,
    });
  }

  findAll() {
    return this.prisma.sku.findMany();
  }

  findOne(id: number) {
    return this.prisma.sku.findUnique({
      where: { id },
    });
  }

  update(id: string, data) {
  if (!id) {
    throw new Error("ID tidak boleh kosong");
  }

  return this.prisma.sku.update({
    where: { id },
    data,
  });
}


  remove(id: number) {
    return this.prisma.sku.delete({
      where: { id },
    });
  }
}
