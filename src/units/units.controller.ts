import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.createUnit(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.unitsService.getUnits(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findUnitById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.unitsService.updateUnit(id, dto);
  }

  // ======== PINDAHKAN INI KE ATAS ===========
  @Patch(':id')
  async softDelete(@Param('id') id: string) {
    return this.unitsService.softDeleteUnit(id);
  }

  @Put(':id/restore')
  async restore(@Param('id') id: string) {
    return this.unitsService.restoreUnit(id);
  }

  @Delete(':id/permanent')
  async hardDelete(@Param('id') id: string) {
    return this.unitsService.deleteUnitPermanently(id);
  }
}
