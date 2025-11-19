# Reusable Pagination, Search, and Filtering System

This document explains how to use the robust, reusable pagination, search, column filtering, and sorting functionality that has been implemented for the NAMS API.

## Overview

The system provides:
- **Pagination**: Page-based and offset-based pagination
- **Global Search**: Search across multiple fields simultaneously
- **Column Filtering**: Advanced filtering with multiple conditions
- **Sorting**: Configurable sorting with validation
- **Soft Delete Support**: Built-in soft delete functionality
- **Type Safety**: Full TypeScript support with validation

## Architecture

### Core Components

1. **PaginationDto**: Common DTO for pagination parameters
2. **QueryBuilderService**: Utility service for building Prisma queries
3. **BaseService**: Abstract service class that can be extended
4. **Common Guards and Decorators**: Role-based access control

### File Structure

```
src/
├── common/
│   ├── dto/
│   │   └── pagination.dto.ts       # Core pagination DTOs and interfaces
│   ├── services/
│   │   ├── base.service.ts         # Abstract base service
│   │   └── query-builder.service.ts # Query building utilities
│   ├── guards/
│   │   └── roles.guard.ts          # Role-based access guard
│   ├── decorators/
│   │   └── roles.decorator.ts      # Role decorator
│   └── common.module.ts            # Common module exports
├── auth/
│   ├── auth.service.ts             # Extended auth service (example)
│   └── auth.controller.ts          # Updated controller (example)
└── examples/
    └── example-post.service.ts     # Example implementation
```

## Usage

### 1. Basic Setup

#### Step 1: Import the Common Module

In your module file:

```typescript
import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { YourService } from './your.service';
import { YourController } from './your.controller';

@Module({
  imports: [CommonModule],
  providers: [YourService],
  controllers: [YourController],
})
export class YourModule {}
```

#### Step 2: Extend BaseService

Create your service by extending `BaseService`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import { QueryBuilderOptions, PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PostService extends BaseService<Post> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.db.post; // Your Prisma model
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'created_at',
      defaultSortDirection: 'desc' as any,
      allowedSortFields: ['id', 'title', 'created_at', 'updated_at'],
      allowedFilterFields: ['id', 'title', 'author_id', 'published'],
      defaultSearchFields: ['title', 'content'],
      softDeleteField: 'deleted_at',
    };
  }

  // Your service methods using inherited functionality
  async findAllPostsPaginated(paginationDto: PaginationDto) {
    const select = {
      id: true,
      title: true,
      content: true,
      published: true,
      created_at: true,
    };

    return this.findAllPaginated(paginationDto, {}, select);
  }
}
```

#### Step 3: Use in Controller

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  @Post('search')
  async getAllPosts(@Body() paginationDto: PaginationDto) {
    return await this.postService.findAllPostsPaginated(paginationDto);
  }
}
```

### 2. Frontend Integration

#### Request Body Format

```typescript
interface PaginationRequest {
  current_page?: number;           // Page number (default: 1)
  pagesize?: number;              // Items per page (default: 10, max: 100)
  offset?: number;                // Alternative to current_page
  sort_column?: string;           // Field to sort by (default: 'created_at')
  sort_direction?: 'asc' | 'desc'; // Sort direction (default: 'desc')
  search?: string;                // Global search term
  search_fields?: string[];       // Fields to search in (optional)
  include_deleted?: boolean;      // Include soft-deleted records (default: false)
  column_filters?: ColumnFilter[]; // Advanced column filters
}

interface ColumnFilter {
  field: string;                  // Field name to filter
  condition: FilterCondition;     // Filter condition
  value?: any;                    // Filter value
  values?: any[];                 // For IN, NOT_IN, BETWEEN conditions
}
```

#### Available Filter Conditions

```typescript
enum FilterCondition {
  CONTAIN = 'contain',
  NOT_CONTAIN = 'not_contain',
  EQUAL = 'equal',
  NOT_EQUAL = 'not_equal',
  START_WITH = 'start_with',
  END_WITH = 'end_with',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  DATE_AFTER = 'date_after',
  DATE_BEFORE = 'date_before',
}
```

#### Example Frontend Requests

**Basic Pagination:**
```javascript
const response = await fetch('/api/posts/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    current_page: 1,
    pagesize: 20,
    sort_column: 'created_at',
    sort_direction: 'desc'
  })
});
```

**Global Search:**
```javascript
const response = await fetch('/api/posts/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    current_page: 1,
    pagesize: 10,
    search: 'javascript tutorial',
    search_fields: ['title', 'content'] // Optional: will use defaults if not provided
  })
});
```

**Advanced Column Filtering:**
```javascript
const response = await fetch('/api/posts/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    current_page: 1,
    pagesize: 10,
    column_filters: [
      {
        field: 'published',
        condition: 'equal',
        value: true
      },
      {
        field: 'title',
        condition: 'contain',
        value: 'tutorial'
      },
      {
        field: 'created_at',
        condition: 'date_after',
        value: '2024-01-01'
      }
    ]
  })
});
```

#### Response Format

```typescript
interface PaginatedResponse<T> {
  data: T[];                      // Array of results
  total: number;                  // Total count of all records
  page: number;                   // Current page number
  limit: number;                  // Items per page
  total_pages: number;            // Total number of pages
  has_next: boolean;              // Whether there's a next page
  has_prev: boolean;              // Whether there's a previous page
}
```

### 3. Advanced Features

#### Custom Additional Filters

```typescript
// In your service method
async findPostsByAuthor(authorId: string, paginationDto: PaginationDto) {
  const additionalWhere = { author_id: authorId, published: true };
  return this.findAllPaginated(paginationDto, additionalWhere);
}
```

#### Custom Select Fields

```typescript
async findPublicPosts(paginationDto: PaginationDto) {
  const select = {
    id: true,
    title: true,
    excerpt: true,
    created_at: true,
    // Don't include sensitive fields
  };
  
  return this.findAllPaginated(paginationDto, {}, select);
}
```

#### Validation and Security

The system includes built-in validation:
- **Field validation**: Only allowed fields can be sorted/filtered
- **Page size limits**: Maximum 100 items per page
- **Type validation**: All inputs are validated using class-validator
- **Role-based access**: Use guards and decorators for access control

#### Soft Delete Support

```typescript
// Include soft-deleted records (admin only)
const allRecords = await this.findAllPaginated(
  { ...paginationDto, include_deleted: true }
);

// Get soft delete statistics
const stats = await this.getSoftDeleteStats();
// Returns: { total, active, deleted, deletionRate }

// Restore a soft-deleted record
await this.restore(recordId);
```

### 4. Migration from Existing Code

To migrate existing pagination code:

1. **Replace custom pagination logic** with `findAllPaginated()`
2. **Update DTOs** to use `PaginationDto`
3. **Remove manual query building** - let `QueryBuilderService` handle it
4. **Update controllers** to use the new DTO format
5. **Add validation** using the built-in guards and decorators

### 5. Best Practices

1. **Configure allowed fields**: Always specify `allowedSortFields` and `allowedFilterFields`
2. **Use select wisely**: Only select fields that are needed for the response
3. **Implement role-based access**: Use guards for sensitive operations
4. **Validate input**: The system provides validation, but add business logic validation as needed
5. **Handle errors gracefully**: The system throws appropriate HTTP exceptions
6. **Consider performance**: Use indexes on fields that are frequently filtered/sorted

### 6. Benefits

- **Consistency**: Same pagination behavior across all modules
- **Maintainability**: Centralized logic for pagination and filtering
- **Security**: Built-in validation and role-based access control
- **Performance**: Efficient query building with proper SQL generation
- **Developer Experience**: Type-safe APIs with comprehensive validation
- **Frontend Friendly**: Standardized request/response format

This system provides a robust foundation for data listing and filtering across your entire application while maintaining consistency and reducing code duplication.
