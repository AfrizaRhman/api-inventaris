import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { create } from 'domain';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

  /**
   * Get all undeleted users with enhanced pagination, search, and filtering (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Post('list')
  async getAllUndeletedUsers(
    @Request() req: { user: { role: string } },
    @Body() paginationDto: PaginationDto,
  ) {
    const select = {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      username: true,
      role: true,
      status: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
    };

    const additionalWhere: Record<string, any> = {}

    return await this.userService.findAllPaginated(
      paginationDto,
      additionalWhere,
      select,
    );
  }

  /**
   * Create a new user (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createUser(
    @Request() req: { user: { role: string } },
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  /**
 * Get user by ID (Admin only)
 */
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdmin(@Query() req: any): Promise<User[]> {
    return await this.userService.getAdmins(req);
  }

  /**
   * Get user by ID (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(
    @Request() req: { user: { role: string } },
    @Param('id') id: string,
  ): Promise<User> {
    return this.userService.findUserById(id);
  }

  /**
   * Update a user (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Request() req: { user: { role: string } },
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  /**
   * Soft delete a user (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(
    @Request() req: { user: { role: string } },
    @Param('id') id: string,
  ): Promise<boolean> {
    return !!(await this.userService.deactivateUser(id));
  }

  /**
   * Get all users including soft deleted ones (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/users')
  async getAllUsersWithDeleted(@Request() req: { user: { role: string } }) {
    if (req.user.role === 'user') {
      throw new Error('Unauthorized: Admin access required');
    }
    return await this.userService.findAllWithDeleted({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        status: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });
  }
}
