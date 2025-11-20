import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UnitService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateUnitDto) {
    return this.unitService.createUnit(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.unitService.findAllUnitsPaginated(pagination);
  }

  @Get(':id')
findOne(@Param('id') id: string) {
  return this.unitService.findUnitById(id);
}

@Put(':id')
update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
  return this.unitService.update(id, dto);
}

@Delete(':id')
remove(@Param('id') id: string) {
  return this.unitService.softDeleteUnit(id);
}
}