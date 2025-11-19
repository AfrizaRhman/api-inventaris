import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { OdtwService } from './odtw.service';
import { CreateOdtwDto, UpdateOdtwDto } from './dto/odtw.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { contains } from 'class-validator';

/**
 * ODTW Controller
 *
 * Provides CRUD operations for ODTW entities with the following features:
 * - Enhanced pagination, search, and filtering for table/list operations
 * - Role-based access control (perhutani role required for most operations)
 * - Soft delete functionality
 * - Comprehensive error handling
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('odtws')
export class OdtwController {
  constructor(private readonly odtwService: OdtwService) {}

  /**
   * Create a new ODTW (perhutani role only)
   */
  @Post()
  @Roles('perhutani')
  async create(@Body() createOdtwDto: CreateOdtwDto, @Req() req: Request) {
    const userId = (req.user as { id?: string })?.id;
    createOdtwDto.created_by = userId;
    return this.odtwService.createOdtw(createOdtwDto);
  }

  /**
   * Get all undeleted ODTWs with enhanced pagination, search, and filtering (perhutani role only)
   */
  @Post('list')
  @Roles('perhutani', 'super_admin')
  async getAllUndeletedOdtws(
    @Req() req: Request,
    @Body() paginationDto: PaginationDto,
  ) {
    const select = {
      id: true,
      odtw_code: true,
      name: true,
      ticket_price: true,
      phone: true,
      address: true,
      village: true,
      district: true,
      city: true,
      province: true,
      email: true,
      longitude: true,
      latitude: true,
      status: true,
      max_device: true,
      webhook_url: true,
      bank_name: true,
      account_name: true,
      account_number: true,
      created_at: true,
      updated_at: true,
      users: {
        select: {
          id: true,
          odtw_id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          status: true,
          created_at: true,
          updated_at: true,
        }
      },
      devices: {
        select: {
          id: true,
          device_name: true,
          device_id: true,
          logged_in: true,
          connected: true,
          meta_data: true,
        },
      },
    };

    return this.odtwService.findAllPaginated(paginationDto, {}, select);
  }

  @Get('/options')
  async getOdtwOptions() {
    return this.odtwService.findAll();
  }

  /**
   * Get ODTW by ID (perhutani and user roles)
   */
  @Get(':id')
  async getOdtwById(@Param('id') id: string) {
    return await this.odtwService.findOdtwById(id);
  }

  /**
   * Update an ODTW (perhutani role only)
   */
  @Patch(':id')
  @Roles('perhutani', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateOdtwDto: UpdateOdtwDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as { id?: string })?.id;
    updateOdtwDto.updated_by = userId;
    return this.odtwService.updateOdtw(id, updateOdtwDto);
  }

  /**
   * Soft delete an ODTW (perhutani role only)
   */
  @Delete(':id')
  @Roles('perhutani')
  async deleteOdtw(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as { id?: string })?.id;
    return await this.odtwService.softDeleteOdtw(id, userId);
  }

  /**
   * Get all ODTWs including soft deleted ones (perhutani role only)
   */
  @Get('admin/odtws')
  @Roles('perhutani')
  async getAllOdtwsWithDeleted(@Req() req: Request) {
    const user = req.user as { role?: string };
    if (!user || user.role !== 'perhutani') {
      throw new Error('Unauthorized: perhutani access required');
    }

    return await this.odtwService.findAllWithDeleted({
      select: {
        id: true,
        odtw_code: true,
        name: true,
        ticket_price: true,
        address: true,
        village: true,
        district: true,
        city: true,
        province: true,
        email: true,
        longitude: true,
        latitude: true,
        status: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });
  }

  /**
   * Synch user with ODTW (perhutani role only)
   */
  @Post('set-admin')
  @Roles('perhutani')
  async setOdtwAdmin(@Body() data: { odtw_id: string; user_id: string }) {
    if (!data.odtw_id || !data.user_id) {
      throw new Error('ODTW ID and User ID are required');
    }
    return await this.odtwService.setOdtwAdmin(data.odtw_id, data.user_id);
  }
}
