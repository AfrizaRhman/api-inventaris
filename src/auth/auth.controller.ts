// ...existing code...
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAuthDto,
  LoginDto,
  UpdateAuthDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createAuthDto: CreateAuthDto,
  ): Promise<Omit<User, 'password'>> {
    return this.authService.register(createAuthDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @Request() req: { user: { id: string } },
  ): Promise<Omit<User, 'password'>> {
    return this.authService.getAuth(req.user.id);
  }

  /**
   * Get all undeleted users with enhanced pagination, search, and filtering (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Post('list')
  async getAllUndeletedUsers(
    @Request() req: { user: { role: string } },
    @Body() paginationDto: PaginationDto,
  ) {
    // Basic role check - in production, use proper role-based guards
    if (req.user.role === 'user') {
      throw new Error('Unauthorized: Admin access required');
    }

    return await this.authService.findAllPaginated(paginationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() updateUserDto: UpdateAuthDto,
  ): Promise<Omit<User, 'password'>> {
    return this.authService.updateProfile(req.user.id, updateUserDto);
  }

  /**
   * Deactivate (soft delete) the current user's profile
   */
  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deactivateAccount(@Request() req: { user: { id: string } }) {
    console.log('Deactivating user with ID:', req.user.id);
    return await this.authService.deactivateUser(req.user.id);
  }

  /**
   * Permanently delete the current user's profile (hard delete)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('profile/permanent')
  async permanentlyDeleteAccount(@Request() req: { user: { id: string } }) {
    console.log('Permanently deleting user with ID:', req.user.id);
    return await this.authService.permanentlyDeleteUser(req.user.id);
  }

  // Password reset endpoints

  /**
   * Deactivate (soft delete) any user's profile by ID (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deactivateUserById(
    @Request() req: { user: { role: string } },
    @Param('id') userId: string,
  ) {
    if (req.user.role === 'user') {
      throw new Error('Unauthorized: Admin access required');
    }
    return await this.authService.deactivateUser(userId);
  }

  /**
   * Request password reset - public endpoint
   */
  @Post('forgot-password')
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return await this.authService.requestPasswordReset(requestPasswordResetDto);
  }

  /**
   * Reset password using token - public endpoint
   */
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  // Admin endpoints for managing soft deleted auths

  /**
   * Get all users including soft deleted ones (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/users/all')
  async getAllUsersWithDeleted(@Request() req: { user: { role: string } }) {
    // Basic role check - in production, use proper role-based guards
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return await this.authService.findAllUsersWithDeleted({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        is_active: true,
        created_at: true,
        deleted_at: true,
      },
    });
  }

  /**
   * Get only soft deleted users (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/users/deleted')
  async getDeletedUsers(@Request() req: { user: { role: string } }) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return await this.authService.findDeletedUsers({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        created_at: true,
        deleted_at: true,
      },
    });
  }

  /**
   * Restore a soft deleted user (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch('admin/users/:id/restore')
  async restoreUser(
    @Request() req: { user: { role: string } },
    @Param('id') userId: string,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return await this.authService.restoreUser(userId);
  }

  /**
   * Permanently delete a user (Admin only) - Hard delete
   */
  @UseGuards(JwtAuthGuard)
  @Delete('admin/users/:id/permanent')
  async permanentlyDeleteUser(
    @Request() req: { user: { role: string } },
    @Param('id') userId: string,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Hard delete - completely remove from database
    return await this.authService.permanentlyDeleteUser(userId);
  }

  /**
   * Get soft delete statistics (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/stats/soft-delete')
  async getSoftDeleteStats(@Request() req: { user: { role: string } }) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    return await this.authService.getSoftDeleteStats();
  }
}
