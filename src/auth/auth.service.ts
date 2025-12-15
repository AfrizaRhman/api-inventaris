import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAuthDto,
  LoginDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  UpdateAuthDto,
} from './dto/auth.dto';
import { User } from '@prisma/client';
import { PaginationDto, QueryBuilderOptions } from 'src/common/dto/pagination.dto';
import { BaseService } from 'src/common/services/base.service';
import { first } from 'rxjs';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

@Injectable()
export class AuthService extends BaseService<User> {
  constructor(
    protected prismaService: PrismaService,
    protected jwtService: JwtService,
  ) {
    super(prismaService);
  }

  /**
   * Get Prisma model delegate for Auth
   */
  protected getModel() {
    return this.prismaService.db.user;
  }

  /**
   * Get query builder options for Client
   */
  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'created_at',
      defaultSortDirection: 'desc' as any,
      allowedSortFields: [
        'id',
        'email',
        'username',
        'password',
        'phone',
        'status',
        'role',
        'created_at',
        'updated_at',
      ],
      allowedFilterFields: [
        'id',
        'username',
        'password',
        'email',
        'phone',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
      defaultSearchFields: ['username', 'email', 'phone'],
      softDeleteField: 'deleted_at',
    };
  }

  async register(
    createAuthDto: CreateAuthDto,
  ): Promise<Omit<User, 'password'>> {
    const { email, username, password, role, phone, first_name, last_name, odtw_id } = createAuthDto;

    // Check if auth already exists (including soft deleted auths)
    const existingAuth = await this.prismaService.db.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingAuth) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prismaService.db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        phone,
        role: role?.toString() || 'user',
        first_name,
        last_name,
        odtw_id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        password_reset_token: true,
        password_reset_expires: true,
        first_name: true,
        last_name: true,
        odtw_id: true,
      },
    });

    console.log('New user created:', user);
    return user;
  }

  async validateUser(
    identifier: string, // can be username or email
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    // Find user by username or email
    const auth = await this.prismaService.db.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!auth || auth.status !== 'active' || auth.deleted_at) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      auth.password as string,
    );
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = auth;
    return result;
  }

  async login(loginDto: LoginDto) {
    // Accept either username or email as identifier
    const auth = await this.validateUser(loginDto.username, loginDto.password);

    if (!auth) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: auth.id,
      username: auth.username,
      email: auth.email,
      role: auth.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: auth.id,
        username: auth.username,
        email: auth.email,
        role: auth.role,
        first_name: auth.first_name,
        last_name: auth.last_name,
        odtw_id: auth.odtw_id,
      },
    };
  }

  async updateProfile(
    id: string,
    updateData: Partial<CreateAuthDto>,
  ): Promise<Omit<User, 'password'>> {
    // Check if auth exists
    await this.findById(id);

    // Check for email/username conflicts if they're being updated
    if (updateData.email || updateData.username) {
      const conflictUser = await this.prismaService.db.user.findFirst({
        where: {
          OR: [
            ...(updateData.email ? [{ email: updateData.email }] : []),
            ...(updateData.username ? [{ username: updateData.username }] : []),
          ],
          NOT: { id },
          deleted_at: null,
        },
      });

      if (conflictUser) {
        throw new ConflictException('Email or username already taken');
      }
    }

    const updatedUser = await this.prismaService.db.user.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: Math.floor(Date.now() / 1000),
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        user_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        password_reset_token: true,
        password_reset_expires: true,
      },
    });

    return updatedUser;
  }

  async deactivateUser(id: string): Promise<any> {
    await this.findById(id); // Check if auth exists

    // Use soft delete instead of hard delete
    return this.prismaService.db.user.delete({
      where: { id },
    });
  }

  // Admin auth management methods

  /**
   * List all users (auths) - Admin only (does not include soft deleted)
   */
  async findAllUsers(options?: {
    where?: Record<string, unknown>;
    select?: Record<string, unknown>;
  }) {
    return await this.prismaService.db.user.findMany({
      ...options,
      where: {
        ...options?.where,
      },
    });
  }

  /**
   * Find all clients with enhanced pagination and filtering
   */
  async findAllClientsPaginated(paginationDto: PaginationDto) {
    const select = {
      id: true,
      username: true,
      email: true,
      phone: true,
      status: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
    };

    return this.findAllPaginated(paginationDto, {}, select);
  }

  /**
   * Find all users including soft deleted ones (Admin only)
   */
  async findAllUsersWithDeleted(options?: {
    where?: Record<string, unknown>;
    select?: Record<string, unknown>;
  }) {
    return await this.prismaService.db.user.findManyWithDeleted({
      ...options,
      where: {
        ...options?.where,
      },
    });
  }

  /**
   * Find only soft deleted users (Admin only)
   */
  async findDeletedUsers(options?: {
    where?: Record<string, unknown>;
    select?: Record<string, unknown>;
  }) {
    return await this.prismaService.db.user.findManyDeleted({
      ...options,
      where: {
        ...options?.where,
      },
    });
  }

  /**
   * Restore a soft deleted user (Admin only)
   */
  async restoreUser(userId: string) {
    return await this.prismaService.db.user.restore({
      where: { id: userId },
    });
  }

  /**
   * Permanently delete a user (Admin only) - Hard delete
   */
  async permanentlyDeleteUser(userId: string) {
    return await this.prismaService.db.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Request password reset - generates a reset token and sends it
   */
  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;

    // Find auth by email
    const auth = await this.prismaService.db.user.findUnique({
      where: { email },
    });

    if (!auth || auth.status !== 'active' || auth.deleted_at) {
      // Don't reveal if email exists for security reasons
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    // Save reset token to database
    await this.prismaService.db.user.update({
      where: { id: auth.id },
      data: {
        password_reset_token: resetToken,
        password_reset_expires: resetTokenExpiry,
      },
    });

    // In a real application, you would send an email here
    // For demo purposes, we'll return the token (remove this in production)
    return {
      message: 'If the email exists, a reset link has been sent.',
      // Remove this in production - only for testing
      resetToken: resetToken,
      resetUrl: `/auth/reset-password?token=${resetToken}`,
    };
  }

  /**
   * Reset password using the reset token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Find auth with valid reset token
    const auth = await this.prismaService.db.user.findFirst({
      where: {
        password_reset_token: token,
        password_reset_expires: {
          gt: Math.floor(Date.now() / 1000), // Token not expired
        },
        status: 'active',
        deleted_at: null,
      },
    });

    if (!auth) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.prismaService.db.user.update({
      where: { id: auth.id },
      data: {
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
        updated_at: Math.floor(Date.now() / 1000),
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  async getAuth(id: string): Promise<any> {
    await this.findById(id); // Check if auth exists

    // Use soft delete instead of hard delete
    return this.prismaService.db.user.findFirst({
      where: { id },
      include:{
        odtw: true
      }
    });
  }

  

  async updateByUserId(
    id: string,
    updateData: Partial<UpdateAuthDto>,
  ): Promise<Omit<User, 'password'>> {
    // Check if user exists
    const currentUser = await this.prismaService.db.user.findUnique({
      where: { id },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Check for email/username conflicts if they're being updated
    if (updateData.email || updateData.username) {
      const conflictUser = await this.prismaService.db.user.findFirst({
        where: {
          OR: [
            ...(updateData.email ? [{ email: updateData.email }] : []),
            ...(updateData.username ? [{ username: updateData.username }] : []),
          ],
          NOT: { id },
        },
      });

      if (conflictUser) {
        throw new ConflictException('Email or username already taken');
      }
    }

    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await this.prismaService.db.user.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: Math.floor(Date.now() / 1000),
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        password_reset_token: true,
        password_reset_expires: true,
        first_name: true,
        last_name: true,
        odtw_id: true,
      },
    });

    return updatedUser;
  }

   async getSoftDeleteStats() {
    const model = this.prismaService.db.user;

    const [total, active] = await Promise.all([
      model.count(),
      model.count({
        where: { deleted_at: null },
      }),
    ]);

    return {
      total,
      active,
      deleted: total - active,
    };
  }
  
}
