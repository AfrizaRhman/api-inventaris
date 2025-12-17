import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Patch,
  Delete,
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
  create(@Body() dto: CreateLoanDto) {
    return this.loansService.createLoan(dto);
  }

  // ✅ FIXED — SEKARANG AMAN
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.loansService.findAllLoans(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findLoanById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLoanDto) {
    return this.loansService.updateLoan(id, dto);
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
