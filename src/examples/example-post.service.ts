import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  PaginationDto,
} from '../common/dto/pagination.dto';

// Example interface for a Post entity
interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  published: boolean;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

@Injectable()
export class ExamplePostService extends BaseService<Post> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  /**
   * Get Prisma model delegate for Posts
   * Replace 'auth' with your actual Prisma model name (using auth as example since it exists)
   */
  protected getModel() {
    return this.prismaService.db.auth; // Replace with your actual model like: this.prismaService.db.post
  }

  /**
   * Get query builder options for Posts
   */
  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'created_at',
      defaultSortDirection: 'desc' as any,
      allowedSortFields: [
        'id',
        'title',
        'author_id',
        'published',
        'created_at',
        'updated_at',
      ],
      allowedFilterFields: [
        'id',
        'title',
        'author_id',
        'published',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
      defaultSearchFields: ['title', 'content'],
      softDeleteField: 'deleted_at',
    };
  }

  /**
   * Find all posts with enhanced pagination and filtering
   */
  async findAllPostsPaginated(paginationDto: PaginationDto) {
    const select = {
      id: true,
      title: true,
      content: true,
      author_id: true,
      published: true,
      created_at: true,
      updated_at: true,
    };

    return this.findAllPaginated(paginationDto, {}, select);
  }

  /**
   * Find posts by author with pagination
   */
  async findPostsByAuthor(authorId: string, paginationDto: PaginationDto) {
    const additionalWhere = { author_id: authorId };
    const select = {
      id: true,
      title: true,
      content: true,
      published: true,
      created_at: true,
      updated_at: true,
    };

    return this.findAllPaginated(paginationDto, additionalWhere, select);
  }

  /**
   * Find only published posts
   */
  async findPublishedPostsPaginated(paginationDto: PaginationDto) {
    const additionalWhere = { published: true };
    const select = {
      id: true,
      title: true,
      content: true,
      author_id: true,
      created_at: true,
      updated_at: true,
    };

    return this.findAllPaginated(paginationDto, additionalWhere, select);
  }
}
