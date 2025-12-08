import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService extends BaseService<any> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.db.unit;
  }

  protected getQueryOptions() {
  return {
    softDeleteField: 'deleted_at',
  };
}


  /* ================= CREATE ================= */

  async createUnit(dto: CreateUnitDto) {
    return this.create({
      name: dto.name,
      deleted_at: null,
    });
  }

  /* ================= READ ================= */

  async getUnits(query: any) {
    const deleted = query.deleted === 'true';

    return this.findAllPaginated(new PaginationDto(), {
      deleted_at: deleted ? { not: null } : null,
    });
  }

  // ✅ hanya ambil ACTIVE
  async findUnitById(id: string) {
    const unit = await this.findById(id);

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found.`);
    }

    return unit;
  }

  // ✅ ambil termasuk soft-deleted
  async findUnitIncludingDeleted(id: string) {
    const unit = await this.getModel().findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found.`);
    }

    return unit;
  }

  /* ================= SOFT DELETE ================= */

  async softDeleteUnit(id: string) {
  // allow using includeDeleted true to check existence; BaseService.softDelete will validate and set Date
  return this.softDelete(id);
}




  /* ================= RESTORE ================= */

  async restoreUnit(id: string) {
  // includeDeleted = true
  const unit = await this.findById(id, undefined, true);

  if (!unit) {
    throw new NotFoundException(`Unit with ID ${id} not found.`);
  }

  if (unit.deleted_at === null) {
    throw new NotFoundException(`Unit with ID ${id} is not deleted.`);
  }

  return this.restore(id); // calls BaseService.restore which now checks then update by id
}





  /* ================= HARD DELETE ================= */

  async deleteUnitPermanently(id: string) {
    await this.findUnitIncludingDeleted(id);

    return this.getModel().delete({
      where: { id },
    });
  }
}
