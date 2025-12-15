import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Patch,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() dto: CreateLoanDto, @Req() req) {
    const adminName = req.user?.name || 'SYSTEM';
    return this.loansService.createLoan(dto, adminName);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.loansService.findAllLoans(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findLoanById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLoanDto, @Req() req) {
    const adminName = req.user?.name || 'SYSTEM';
    return this.loansService.updateLoan(id, dto, adminName);
  }

  @Patch(':id/soft-delete')
  softDelete(@Param('id') id: string) {
    return this.loansService.softDeleteLoan(id);
  }

  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.loansService.restoreLoan(id);
  }

  @Delete(':id/hard-delete')
  hardDelete(@Param('id') id: string) {
    return this.loansService.hardDeleteLoan(id);
  }
}
