/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  PaginationDto,
} from '../common/dto/pagination.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.db.user;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'created_at',
      defaultSortDirection: 'desc' as any,
      allowedSortFields: [
        'id',
        'first_name',
        'last_name',
        'username',
        'email',
        'phone',
        'status',
        'created_at',
        'updated_at',
      ],
      allowedFilterFields: [
        'id',
        'first_name',
        'last_name',
        'username',
        'email',
        'phone',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
      defaultSearchFields: ['first_name', 'last_name', 'email', 'phone'],
      softDeleteField: 'deleted_at',
    };
  }

  async findAllUsersPaginated(paginationDto: PaginationDto) {
    const select = {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      status: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
    };
    return this.findAllPaginated(paginationDto, {}, select);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (!createUserDto.password) {
      throw new BadRequestException('Password is required');
    }
    if (!createUserDto.username) {
      throw new BadRequestException('Username is required');
    }

    // Check for existing user with the same email or username
    const existingUser = await this.prismaService.db.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });
    if (existingUser) {
      throw new ConflictException('Email or Username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user: User = (await this.prismaService.db.user.create({
      data: {
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        email: createUserDto.email,
        phone: createUserDto.phone,
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role || 'user',
        status: createUserDto.status || 'active',
        odtw_id: createUserDto.odtw_id || null,
      },
      select: {
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
      },
    })) as User;

    // if user has odtw_id, set odtw_id to null on other users with the same odtw_id
    if (createUserDto.role === 'admin' && createUserDto.odtw_id) {
      await this.prismaService.db.user.updateMany({
        where: {
          odtw_id: createUserDto.odtw_id,
          role: 'admin',
          deleted_at: null,
          NOT: { id: user.id }, // Jangan update user yang baru dibuat
        },
        data: {
          odtw_id: null,
        },
      });
    }
    return user;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.prismaService.db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user: User = await this.prismaService.db.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');

    // Check for email/username conflicts if they're being updated
    if (updateUserDto.email) {
      const conflictUser = await this.prismaService.db.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id },
        },
      });

      if (conflictUser) {
        throw new ConflictException('Email already taken');
      }
    }

    if (updateUserDto.phone) {
      const conflictUser = await this.prismaService.db.user.findFirst({
        where: {
          phone: updateUserDto.phone,
          NOT: { id },
        },
      });

      if (conflictUser) {
        throw new ConflictException('Phone already taken');
      }
    }

    if (updateUserDto.username) {
      const conflictUser = await this.prismaService.db.user.findFirst({
        where: {
          username: updateUserDto.username,
          NOT: { id },
        },
      });

      if (conflictUser) {
        throw new ConflictException('Username already taken');
      }
    }

    const updateData: any = {
      first_name: updateUserDto.first_name,
      last_name: updateUserDto.last_name,
      email: updateUserDto.email,
      phone: updateUserDto.phone,
      username: updateUserDto.username,
      role: updateUserDto.role,
      status: updateUserDto.status || 'active',
    };

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateData.password = hashedPassword;
    }

    return this.prismaService.db.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deactivateUser(id: string) {
    const user = await this.prismaService.db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prismaService.db.user.delete({
      where: { id: id },
    });
  }

  async findAllWithDeleted(select: any) {
    return await this.prismaService.db.user.findMany({ select });
  }

  async getAdmins(req: any): Promise<User[]> {
    const conditions: any[] = [
      { role: 'admin', odtw_id: null }
    ];

    // Tambahkan kondisi id hanya jika user_id valid (bukan null/undefined/'')
    if (req.user_id) {
      conditions.push({ id: req.user_id });
    }

    const admin = await this.prismaService.db.user.findMany({
      where: {
        OR: conditions,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!admin || admin.length === 0) throw new NotFoundException('Admin user not found');
    return admin as User[];
  }
}
